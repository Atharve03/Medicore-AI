const { User } = require('../models/user.model');

const userRepository = {
  findByEmail(email, { withPassword = false } = {}) {
    const query = User.findOne({ email });
    return withPassword ? query.select('+passwordHash') : query;
  },

  findById(id, { withPassword = false } = {}) {
    const query = User.findById(id);
    return withPassword ? query.select('+passwordHash') : query;
  },

  async create({ fullName, email, password, role }) {
    const passwordHash = await User.hashPassword(password);
    return User.create({ fullName, email, passwordHash, role });
  },

  updateLastLogin(id) {
    return User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  },

  async list({ role, search, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },

  countByRole() {
    return User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { _id: 0, role: '$_id', count: 1 } },
    ]);
  },

  countActiveInactive() {
    return User.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } },
      { $project: { _id: 0, isActive: '$_id', count: 1 } },
    ]);
  },

  updateById(id, updates) {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },

  setActive(id, isActive) {
    return User.findByIdAndUpdate(id, { isActive }, { new: true });
  },
};

module.exports = userRepository;
