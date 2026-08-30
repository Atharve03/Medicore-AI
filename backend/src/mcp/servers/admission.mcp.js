const admissionRepository = require('../../repositories/admission.repository');
const { assertCanAccessPatient } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'doctor', 'nurse'];

module.exports = {
  name: 'admission',
  description: "A patient's admission/discharge history.",
  tools: {
    listForPatient: {
      description: 'Recent admissions for a patient, most recent first.',
      async handler({ patientId, limit = 5 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await admissionRepository.listByPatient({
          patientId,
          page: 1,
          limit,
        });
        return items.map((a) => a.toClientJSON());
      },
    },
  },
};
