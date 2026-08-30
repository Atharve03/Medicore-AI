const { Patient } = require('../models/patient.model');

const patientRepository = {
  create({ userId, fullName }) {
    return Patient.create({ userId, fullName });
  },

  findByUserId(userId) {
    return Patient.findOne({ userId });
  },

  findById(id) {
    return Patient.findById(id);
  },

  updateByUserId(userId, updates) {
    return Patient.findOneAndUpdate({ userId }, updates, {
      new: true,
      runValidators: true,
    });
  },

  async list({ search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};

module.exports = patientRepository;
