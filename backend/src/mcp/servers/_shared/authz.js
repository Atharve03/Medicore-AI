const patientRepository = require('../../../repositories/patient.repository');
const doctorRepository = require('../../../repositories/doctor.repository');

class McpAccessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'McpAccessError';
  }
}

/**
 * Resolves the requesting user's own Patient document. Throws if the user
 * isn't a patient or has no linked profile.
 */
async function resolveOwnPatientId(requestingUser) {
  if (requestingUser.role !== 'patient') {
    throw new McpAccessError('Only a patient account can act as itself here');
  }
  const patient = await patientRepository.findByUserId(requestingUser.id);
  if (!patient) {
    throw new McpAccessError('No patient profile linked to this account');
  }
  return String(patient._id);
}

async function resolveOwnDoctorId(requestingUser) {
  if (requestingUser.role !== 'doctor') {
    throw new McpAccessError('Only a doctor account can act as itself here');
  }
  const doctor = await doctorRepository.findByUserId(requestingUser.id);
  if (!doctor) {
    throw new McpAccessError('No doctor profile linked to this account');
  }
  return String(doctor._id);
}

/**
 * The core patient-data guard every patient-scoped tool uses: a `patient`
 * caller may only ever request their own `targetPatientId`; any role in
 * `staffRoles` may request any patient's. Everyone else is denied. Mirrors
 * assertPatientCanView() in the REST modules (Medical Record, Laboratory,
 * Billing, Admission) exactly, so AI access never exceeds API access.
 */
async function assertCanAccessPatient(requestingUser, targetPatientId, staffRoles = []) {
  if (requestingUser.role === 'patient') {
    const ownId = await resolveOwnPatientId(requestingUser);
    if (ownId !== String(targetPatientId)) {
      throw new McpAccessError("Cannot access another patient's data");
    }
    return;
  }
  if (!staffRoles.includes(requestingUser.role)) {
    throw new McpAccessError(`Role '${requestingUser.role}' cannot access patient data here`);
  }
}

module.exports = {
  McpAccessError,
  resolveOwnPatientId,
  resolveOwnDoctorId,
  assertCanAccessPatient,
};
