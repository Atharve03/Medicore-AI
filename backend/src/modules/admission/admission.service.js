const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const admissionRepository = require('../../repositories/admission.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

async function resolveDoctorId(requestingUser, payload) {
  if (requestingUser.role === 'doctor') {
    const doctor = await doctorRepository.findByUserId(requestingUser.id);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return doctor._id;
  }

  // nurse admitting on the attending doctor's behalf
  if (!payload.doctorId) {
    throw ApiError.badRequest('doctorId is required when admitting as a nurse');
  }
  const doctor = await doctorRepository.findById(payload.doctorId);
  if (!doctor) throw ApiError.notFound('Doctor not found');
  return doctor._id;
}

async function createAdmission(requestingUser, payload) {
  const patient = await patientRepository.findById(payload.patientId);
  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }

  const doctorId = await resolveDoctorId(requestingUser, payload);

  const occupied = await admissionRepository.findOccupiedBed({
    wardType: payload.wardType,
    bedNumber: payload.bedNumber,
  });
  if (occupied) {
    throw ApiError.conflict(
      `Bed '${payload.bedNumber}' in '${payload.wardType}' is already occupied`
    );
  }

  const admission = await admissionRepository.create({
    patientId: patient._id,
    doctorId,
    wardType: payload.wardType,
    bedNumber: payload.bedNumber,
    expectedDischargeAt: payload.expectedDischargeAt || null,
  });

  return admission.toClientJSON();
}

async function dischargeAdmission(id) {
  const admission = await admissionRepository.findById(id);
  if (!admission) {
    throw ApiError.notFound('Admission not found');
  }
  if (admission.status === 'discharged') {
    throw ApiError.badRequest('This patient has already been discharged');
  }

  const updated = await admissionRepository.discharge(id);
  return updated.toClientJSON();
}

/**
 * A patient may only ever see their own admission history; doctor and
 * nurse may see any patient's.
 */
async function assertPatientCanView(requestingUser, admissionPatientId) {
  if (requestingUser.role !== 'patient') return;

  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient || String(patient._id) !== String(admissionPatientId)) {
    throw ApiError.forbidden('You may only view your own admission records');
  }
}

async function listByPatient(patientId, requestingUser, query) {
  await assertPatientCanView(requestingUser, patientId);

  const { page, limit } = parsePagination(query);
  const { items, total } = await admissionRepository.listByPatient({
    patientId,
    status: query.status,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((a) => a.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { createAdmission, dischargeAdmission, listByPatient };
