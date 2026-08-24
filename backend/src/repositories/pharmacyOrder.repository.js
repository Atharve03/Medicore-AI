const { PharmacyOrder } = require('../models/pharmacyOrder.model');

const pharmacyOrderRepository = {
  create(data) {
    return PharmacyOrder.create(data);
  },

  async list({ patientId, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (patientId) filter.patientId = patientId;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      PharmacyOrder.find(filter).sort({ dispensedAt: -1 }).skip(skip).limit(limit),
      PharmacyOrder.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },
};

module.exports = pharmacyOrderRepository;
