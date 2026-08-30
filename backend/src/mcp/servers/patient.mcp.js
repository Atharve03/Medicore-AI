const patientRepository = require('../../repositories/patient.repository');
const { assertCanAccessPatient, resolveOwnPatientId } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'doctor', 'receptionist'];

module.exports = {
  name: 'patient',
  description: "A patient's own profile: demographics, blood group, allergies, emergency contact.",
  tools: {
    getOwnProfile: {
      description: "Fetch the calling patient's own profile.",
      async handler(_args, { requestingUser }) {
        const patientId = await resolveOwnPatientId(requestingUser);
        const patient = await patientRepository.findById(patientId);
        return patient ? patient.toClientJSON() : null;
      },
    },
    getProfile: {
      description: 'Fetch one patient profile by id.',
      async handler({ patientId }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const patient = await patientRepository.findById(patientId);
        if (!patient) return null;
        return patient.toClientJSON();
      },
    },
  },
};
