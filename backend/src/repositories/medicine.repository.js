const { Medicine } = require('../models/medicine.model');

const medicineRepository = {
  create(data) {
    return Medicine.create(data);
  },

  findById(id) {
    return Medicine.findById(id);
  },

  updateById(id, updates) {
    return Medicine.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },

  async list({ search, category, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Medicine.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Medicine.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  /**
   * Atomically decrements stock only if enough remains, in a single
   * findOneAndUpdate so two concurrent dispenses can't both succeed against
   * stock that only covers one of them. Returns null if insufficient stock.
   */
  decrementStockIfAvailable(id, quantity) {
    return Medicine.findOneAndUpdate(
      { _id: id, stockQuantity: { $gte: quantity } },
      { $inc: { stockQuantity: -quantity } },
      { new: true }
    );
  },
};

module.exports = medicineRepository;
