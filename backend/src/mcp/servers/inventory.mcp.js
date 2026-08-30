const inventoryRepository = require('../../repositories/inventory.repository');

const STAFF_ROLES = ['admin', 'nurse'];

module.exports = {
  name: 'inventory',
  description: 'Hospital equipment/supply stock levels (no patient data).',
  tools: {
    getLowStockItems: {
      description: 'Items at or below their reorder level.',
      async handler({ limit = 20 }, { requestingUser }) {
        if (!STAFF_ROLES.includes(requestingUser.role)) {
          throw new Error(`Role ${requestingUser.role} cannot access inventory stats`);
        }
        const { items } = await inventoryRepository.list({
          lowStockOnly: true,
          page: 1,
          limit,
        });
        return items.map((i) => i.toClientJSON());
      },
    },
  },
};
