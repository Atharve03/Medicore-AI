const labReportRepository = require('../../repositories/labReport.repository');
const { assertCanAccessPatient } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'doctor', 'labTechnician'];

module.exports = {
  name: 'laboratory',
  description: "A patient's lab test orders and results.",
  tools: {
    /**
     * This is the exact tool ARCHITECTURE.md's data-flow example calls:
     * patient asks "explain my latest blood report" -> Orchestrator ->
     * laboratory.getLatestReportForPatient -> only this one report enters
     * the AI prompt, nothing else from the patient's chart.
     */
    getLatestReportForPatient: {
      description: 'The single most recent *completed* lab report for a patient.',
      async handler({ patientId }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const report = await labReportRepository.findLatestForPatient(patientId);
        if (!report) return null;
        return report.toClientJSON();
      },
    },

    listForPatient: {
      description: 'Recent lab orders/reports for a patient, most recent first.',
      async handler({ patientId, limit = 10 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await labReportRepository.listByPatient({
          patientId,
          page: 1,
          limit,
        });
        return items.map((r) => r.toClientJSON());
      },
    },
  },
};
