const pharmacyOrderRepository = require('../../repositories/pharmacyOrder.repository');

module.exports = {
  name: 'pharmacy',
  description: 'Hospital-wide medicine dispensing statistics (no per-patient data).',
  tools: {
    getUsageStats: {
      description: 'Top dispensed medicines by quantity and revenue, hospital-wide.',
      async handler({ limit = 5 }, { requestingUser }) {
        if (!['admin', 'superAdmin'].includes(requestingUser.role)) {
          throw new Error(`Role ${requestingUser.role} cannot access pharmacy usage stats`);
        }
        return pharmacyOrderRepository.getTopDispensedMedicines(limit);
      },
    },
  },
};
