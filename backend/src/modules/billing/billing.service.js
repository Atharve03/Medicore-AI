const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const invoiceRepository = require('../../repositories/invoice.repository');
const patientRepository = require('../../repositories/patient.repository');

async function createInvoice(payload) {
  const patient = await patientRepository.findById(payload.patientId);
  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  const totalAmount = payload.lineItems.reduce((sum, item) => sum + item.amount, 0);

  const invoice = await invoiceRepository.create({
    patientId: patient._id,
    relatedTo: payload.relatedTo,
    lineItems: payload.lineItems,
    totalAmount,
  });

  return invoice.toClientJSON();
}

/**
 * A patient may only ever see their own invoices; receptionist/admin see
 * any patient's.
 */
async function assertPatientCanView(requestingUser, invoicePatientId) {
  if (requestingUser.role !== 'patient') return;

  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient || String(patient._id) !== String(invoicePatientId)) {
    throw ApiError.forbidden('You may only view your own invoices');
  }
}

async function listByPatient(patientId, requestingUser, query) {
  await assertPatientCanView(requestingUser, patientId);

  const { page, limit } = parsePagination(query);
  const { items, total } = await invoiceRepository.listByPatient({
    patientId,
    status: query.status,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((i) => i.toClientJSON()),
    total,
    page,
    limit,
  });
}

/**
 * Payment recording is fully atomic and overpayment-guarded at the
 * repository layer (see invoiceRepository.recordPayment); if it returns
 * null here, we distinguish "doesn't exist" from "guard rejected it" only
 * to give a clearer error message — the actual safety already happened.
 */
async function payInvoice(id, amount) {
  const existing = await invoiceRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound('Invoice not found');
  }
  if (existing.status === 'void') {
    throw ApiError.badRequest('This invoice has been voided and cannot accept payment');
  }
  if (existing.status === 'paid') {
    throw ApiError.badRequest('This invoice is already fully paid');
  }

  const updated = await invoiceRepository.recordPayment(id, amount);
  if (!updated) {
    throw ApiError.badRequest(
      `Payment of ${amount} exceeds the remaining balance of ${
        existing.totalAmount - existing.paidAmount
      }`
    );
  }

  return updated.toClientJSON();
}

module.exports = { createInvoice, listByPatient, payInvoice };
