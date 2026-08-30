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

  /**
   * Doctor headcount by department. Backs the Analytics MCP server's
   * department-performance tool.
   */
  countByDepartment() {
    return Doctor.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', doctorCount: { $sum: 1 } } },
      { $project: { _id: 0, department: '$_id', doctorCount: 1 } },
      { $sort: { doctorCount: -1 } },
    ]);
  },
};

module.exports = doctorRepository;
