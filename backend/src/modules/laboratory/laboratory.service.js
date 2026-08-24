const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const labReportRepository = require('../../repositories/labReport.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

async function createOrder(requestingUser, payload) {
  const doctor = await doctorRepository.findByUserId(requestingUser.id);
  if (!doctor) {
    throw ApiError.notFound('Doctor profile not found');
  }

  const patient = await patientRepository.findById(payload.patientId);
  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  const order = await labReportRepository.create({
    patientId: patient._id,
    doctorId: doctor._id,
    testType: payload.testType,
  });

  return order.toClientJSON();
}

/**
 * A lab technician submits results exactly once per order — results are
 * treated as immutable once the report is completed, so corrections require
 * a new order rather than silently overwriting a finalized report.
 */
async function submitResults(id, payload, reportFileUrl) {
  const order = await labReportRepository.findById(id);
  if (!order) {
    throw ApiError.notFound('Lab order not found');
  }
  if (order.status === 'completed') {
    throw ApiError.badRequest('Results have already been submitted for this order');
  }

  const updated = await labReportRepository.submitResults(id, {
    results: payload.results,
    reportFileUrl,
  });

  return updated.toClientJSON();
}

/**
 * A patient may only ever see their own reports; doctor and lab technician
 * may see any patient's (the technician needs this across the whole queue).
 */
async function assertPatientCanView(requestingUser, reportPatientId) {
  if (requestingUser.role !== 'patient') return;

  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient || String(patient._id) !== String(reportPatientId)) {
    throw ApiError.forbidden('You may only view your own lab reports');
  }
}

async function listByPatient(patientId, requestingUser, query) {
  await assertPatientCanView(requestingUser, patientId);

  const { page, limit } = parsePagination(query);
  const { items, total } = await labReportRepository.listByPatient({
    patientId,
    status: query.status,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((r) => r.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { createOrder, submitResults, listByPatient };
