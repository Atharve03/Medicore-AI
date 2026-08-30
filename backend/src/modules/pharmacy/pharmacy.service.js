const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const medicineRepository = require('../../repositories/medicine.repository');
const pharmacyOrderRepository = require('../../repositories/pharmacyOrder.repository');
const prescriptionRepository = require('../../repositories/prescription.repository');

async function createMedicine(payload) {
  const medicine = await medicineRepository.create(payload);
  return medicine.toClientJSON();
}

async function updateMedicine(id, updates) {
  const medicine = await medicineRepository.updateById(id, updates);
  if (!medicine) {
    throw ApiError.notFound('Medicine not found');
  }
  return medicine.toClientJSON();
}

async function listMedicines(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await medicineRepository.list({
    search: query.search,
    category: query.category,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((m) => m.toClientJSON()),
    total,
    page,
    limit,
  });
}

/**
 * Dispenses against an active prescription. Stock is decremented one item
 * at a time via an atomic conditional update (see
 * medicineRepository.decrementStockIfAvailable); if any item in the batch
 * fails (unknown medicine, not on the prescription, or insufficient stock),
 * every item already decremented in this call is rolled back before the
 * error is raised, so a partially-fulfilled order is never left dangling.
 *
 * Note: this is a compensating rollback rather than a multi-document
 * transaction, since the docker-compose Mongo service runs as a single
 * node (no replica set) and Mongoose transactions require one. Enabling a
 * replica set is a reasonable Phase 25 (Deployment) enhancement.
 */
async function dispense(requestingUser, payload) {
  const prescription = await prescriptionRepository.findById(payload.prescriptionId);
  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }
  if (prescription.status !== 'active') {
    throw ApiError.badRequest(
      `This prescription is '${prescription.status}' and cannot be dispensed`
    );
  }

  const prescribedMedicineIds = new Set(
    prescription.medicines.map((m) => String(m.medicineId))
  );
  for (const item of payload.items) {
    if (!prescribedMedicineIds.has(String(item.medicineId))) {
      throw ApiError.badRequest(
        'One or more items are not part of the referenced prescription'
      );
    }
  }

  const decremented = [];
  let dispensedItems;
  try {
    dispensedItems = [];
    for (const item of payload.items) {
      const medicine = await medicineRepository.decrementStockIfAvailable(
        item.medicineId,
        item.quantity
      );
      if (!medicine) {
        const current = await medicineRepository.findById(item.medicineId);
        throw ApiError.conflict(
          `Insufficient stock for '${current ? current.name : item.medicineId}'`
        );
      }
      decremented.push(item);
      dispensedItems.push({
        medicineId: medicine._id,
        quantity: item.quantity,
        unitPrice: medicine.unitPrice,
      });
    }
  } catch (err) {
    // Roll back every item already decremented before this one failed.
    await Promise.all(
      decremented.map((item) =>
        medicineRepository
          .updateById(item.medicineId, { $inc: { stockQuantity: item.quantity } })
          .catch(() => {})
      )
    );
    throw err;
  }

  const totalAmount = dispensedItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const order = await pharmacyOrderRepository.create({
    prescriptionId: prescription._id,
    patientId: prescription.patientId,
    dispensedBy: requestingUser.id,
    items: dispensedItems,
    totalAmount,
  });

  await prescriptionRepository.updateStatus(prescription._id, 'dispensed');

  return order.toClientJSON();
}

async function listOrders(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await pharmacyOrderRepository.list({
    patientId: query.patientId,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((o) => o.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = {
  createMedicine,
  updateMedicine,
  listMedicines,
  dispense,
  listOrders,
};
