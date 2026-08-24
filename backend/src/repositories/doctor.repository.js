const { Doctor } = require('../models/doctor.model');

const doctorRepository = {
  create({ userId, fullName }) {
    return Doctor.create({ userId, fullName });
  },

  findByUserId(userId) {
    return Doctor.findOne({ userId });
  },

  findById(id) {
    return Doctor.findById(id);
  },

  updateByUserId(userId, updates) {
    return Doctor.findOneAndUpdate({ userId }, updates, {
      new: true,
      runValidators: true,
    });
  },

  async list({ search, department, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Doctor.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};

module.exports = doctorRepository;
