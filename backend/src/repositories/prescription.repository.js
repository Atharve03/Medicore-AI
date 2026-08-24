const { Prescription } = require('../models/prescription.model');

const prescriptionRepository = {
  create(data) {
    return Prescription.create(data);
  },

  findById(id) {
    return Prescription.findById(id);
  },

  async listByPatient({ patientId, status, page = 1, limit = 20 }) {
    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Prescription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Prescription.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  updateStatus(id, status) {
    return Prescription.findByIdAndUpdate(id, { status }, { new: true });
  },
};

module.exports = prescriptionRepository;
