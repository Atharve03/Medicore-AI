const prescriptionRepository = require('../../repositories/prescription.repository');
const { assertCanAccessPatient } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'doctor', 'pharmacist'];

module.exports = {
  name: 'prescription',
  description: "A patient's prescriptions: medicines, dosage, frequency, status.",
  tools: {
    getLatestForPatient: {
      description: "A patient's single most recent prescription.",
      async handler({ patientId }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await prescriptionRepository.listByPatient({
          patientId,
          page: 1,
          limit: 1,
        });
        return items[0] ? items[0].toClientJSON() : null;
      },
    },

    listForPatient: {
      description: 'Recent prescriptions for a patient, most recent first.',
      async handler({ patientId, limit = 10 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await prescriptionRepository.listByPatient({
          patientId,
          page: 1,
          limit,
        });
        return items.map((p) => p.toClientJSON());
      },
    },
  },
};
