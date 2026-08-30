const { User } = require('../models/user.model');

const userRepository = {
  findByEmail(email, { withPassword = false, withOtp = false } = {}) {
    let query = User.findOne({ email });
    if (withPassword) query = query.select('+passwordHash');
    if (withOtp) query = query.select('+otp.codeHash');
    return query;
  },

  findById(id, { withPassword = false, withResetToken = false } = {}) {
    const query = User.findById(id);
    if (withPassword) query.select('+passwordHash');
    if (withResetToken) query.select('+passwordReset.tokenHash');
    return query;
  },

  async create({ fullName, email, password, role, isEmailVerified = false }) {
    const passwordHash = await User.hashPassword(password);
    return User.create({ fullName, email, passwordHash, role, isEmailVerified });
  },

  updateLastLogin(id) {
    return User.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  },

  setOtp(id, otpRecord) {
    return User.findByIdAndUpdate(id, { otp: otpRecord }, { new: true });
  },

  incrementOtpAttempts(id) {
    return User.findByIdAndUpdate(id, { $inc: { 'otp.attempts': 1 } });
  },

  clearOtpAndVerifyEmail(id) {
    return User.findByIdAndUpdate(
      id,
      {
        isEmailVerified: true,
        otp: { codeHash: null, purpose: null, expiresAt: null, attempts: 0, sentAt: null },
      },
      { new: true }
    );
  },

  clearOtp(id) {
    return User.findByIdAndUpdate(id, {
      otp: { codeHash: null, purpose: null, expiresAt: null, attempts: 0, sentAt: null },
    });
  },

  setPasswordResetToken(id, passwordReset) {
    return User.findByIdAndUpdate(id, { passwordReset }, { new: true });
  },

  async updatePasswordAndClearReset(id, password) {
    const passwordHash = await User.hashPassword(password);
    return User.findByIdAndUpdate(id, {
      passwordHash,
      passwordReset: { tokenHash: null, expiresAt: null },
      otp: { codeHash: null, purpose: null, expiresAt: null, attempts: 0, sentAt: null },
    });
  },

  async updatePassword(id, password) {
    const passwordHash = await User.hashPassword(password);
    return User.findByIdAndUpdate(id, { passwordHash });
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
