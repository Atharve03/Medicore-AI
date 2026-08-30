const { PharmacyOrder } = require('../models/pharmacyOrder.model');

const pharmacyOrderRepository = {
  create(data) {
    return PharmacyOrder.create(data);
  },

  async list({ patientId, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (patientId) filter.patientId = patientId;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      PharmacyOrder.find(filter).sort({ dispensedAt: -1 }).skip(skip).limit(limit),
      PharmacyOrder.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  /**
   * Top dispensed medicines by total quantity, joined against the catalog
   * for display names. Backs the Pharmacy MCP server's usage-stats tool.
   */
  getTopDispensedMedicines(limit = 5) {
    return PharmacyOrder.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicineId',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine',
        },
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          medicineId: '$_id',
          name: '$medicine.name',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);
  },
};

module.exports = pharmacyOrderRepository;
