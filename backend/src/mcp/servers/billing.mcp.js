const invoiceRepository = require('../../repositories/invoice.repository');
const { assertCanAccessPatient } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'receptionist'];

module.exports = {
  name: 'billing',
  description: "A patient's invoice summary, or hospital-wide revenue stats.",
  tools: {
    getSummaryForPatient: {
      description: "A patient's recent invoices and total balance due.",
      async handler({ patientId, limit = 10 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await invoiceRepository.listByPatient({
          patientId,
          page: 1,
          limit,
        });
        const invoices = items.map((i) => i.toClientJSON());
        const totalDue = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
        return { invoices, totalDue };
      },
    },

    getRevenueStats: {
      description: 'Hospital-wide billed/collected/outstanding totals.',
      async handler(_args, { requestingUser }) {
        if (requestingUser.role !== 'admin') {
          throw new Error(`Role ${requestingUser.role} cannot access revenue stats`);
        }
        return invoiceRepository.getRevenueStats();
      },
    },
  },
};
