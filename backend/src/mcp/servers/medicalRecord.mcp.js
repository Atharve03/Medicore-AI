const medicalRecordRepository = require('../../repositories/medicalRecord.repository');
const { assertCanAccessPatient } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'doctor'];

module.exports = {
  name: 'medicalRecord',
  description: "A patient's visit history: diagnoses, symptoms, notes.",
  tools: {
    listForPatient: {
      description: 'Recent medical records for one patient, most recent first.',
      async handler({ patientId, limit = 10 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await medicalRecordRepository.listByPatient({
          patientId,
          page: 1,
          limit,
        });
        return items.map((r) => r.toClientJSON());
      },
    },

    getById: {
      description: 'One specific medical record by id (e.g. the record a prescription references).',
      async handler({ recordId }, { requestingUser }) {
        const record = await medicalRecordRepository.findById(recordId);
        if (!record) return null;
        await assertCanAccessPatient(requestingUser, record.patientId, STAFF_ROLES);
        return record.toClientJSON();
      },
    },
  },
};
