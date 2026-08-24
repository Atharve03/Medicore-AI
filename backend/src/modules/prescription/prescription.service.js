const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const prescriptionRepository = require('../../repositories/prescription.repository');
const medicalRecordRepository = require('../../repositories/medicalRecord.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

/**
 * patientId and doctorId are never taken from the client — they're derived
 * from the medical record itself, so a prescription always traces back to
 * a real visit and can't be forged against the wrong patient.
 */
async function createPrescription(requestingUser, payload) {
  const doctor = await doctorRepository.findByUserId(requestingUser.id);
  if (!doctor) {
    throw ApiError.notFound('Doctor profile not found');
  }

  const medicalRecord = await medicalRecordRepository.findById(payload.medicalRecordId);
  if (!medicalRecord) {
    throw ApiError.notFound('Medical record not found');
  }

  if (String(medicalRecord.doctorId) !== String(doctor._id)) {
    throw ApiError.forbidden(
      'You may only prescribe against a medical record you authored'
    );
  }

  const prescription = await prescriptionRepository.create({
    medicalRecordId: medicalRecord._id,
    patientId: medicalRecord.patientId,
    doctorId: doctor._id,
    medicines: payload.medicines,
  });

  return prescription.toClientJSON();
}

/**
 * A patient may only ever see their own prescriptions; doctor and
 * pharmacist may see any patient's (the pharmacist needs this to dispense
 * in Phase 11).
 */
async function assertPatientCanView(requestingUser, recordPatientId) {
  if (requestingUser.role !== 'patient') return;

  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient || String(patient._id) !== String(recordPatientId)) {
    throw ApiError.forbidden('You may only view your own prescriptions');
  }
}

async function getById(id, requestingUser) {
  const prescription = await prescriptionRepository.findById(id);
  if (!prescription) {
    throw ApiError.notFound('Prescription not found');
  }

  await assertPatientCanView(requestingUser, prescription.patientId);

  return prescription.toClientJSON();
}

async function listByPatient(patientId, requestingUser, query) {
  await assertPatientCanView(requestingUser, patientId);

  const { page, limit } = parsePagination(query);
  const { items, total } = await prescriptionRepository.listByPatient({
    patientId,
    status: query.status,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((p) => p.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { createPrescription, getById, listByPatient };
