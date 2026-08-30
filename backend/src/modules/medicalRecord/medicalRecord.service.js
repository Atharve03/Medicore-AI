const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const medicalRecordRepository = require('../../repositories/medicalRecord.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

async function createRecord(requestingUser, payload, attachments) {
  const doctor = await doctorRepository.findByUserId(requestingUser.id);
  if (!doctor) {
    throw ApiError.notFound('Doctor profile not found');
  }

  const patient = await patientRepository.findById(payload.patientId);
  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  const record = await medicalRecordRepository.create({
    patientId: patient._id,
    doctorId: doctor._id,
    appointmentId: payload.appointmentId || null,
    visitDate: payload.visitDate || undefined,
    symptoms: payload.symptoms || [],
    diagnosis: payload.diagnosis,
    notes: payload.notes || null,
    attachments,
  });

  return record.toClientJSON();
}

/**
 * A patient may only ever see their own records; a doctor may see any
 * patient's records (consistent with how hospital charts are shared across
 * treating clinicians, not siloed per-doctor).
 */
async function assertPatientCanView(requestingUser, recordPatientId) {
  if (requestingUser.role !== 'patient') return;

  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient || String(patient._id) !== String(recordPatientId)) {
    throw ApiError.forbidden('You may only view your own medical records');
  }
}

async function getById(id, requestingUser) {
  const record = await medicalRecordRepository.findById(id);
  if (!record) {
    throw ApiError.notFound('Medical record not found');
  }

  await assertPatientCanView(requestingUser, record.patientId);

  return record.toClientJSON();
}

async function listByPatient(patientId, requestingUser, query) {
  await assertPatientCanView(requestingUser, patientId);

  const { page, limit } = parsePagination(query);
  const { items, total } = await medicalRecordRepository.listByPatient({
    patientId,
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

module.exports = { createRecord, getById, listByPatient };
