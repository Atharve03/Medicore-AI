const { InventoryItem } = require('../models/inventoryItem.model');

const inventoryRepository = {
  create(data) {
    return InventoryItem.create(data);
  },

  findById(id) {
    return InventoryItem.findById(id);
  },

  updateById(id, updates) {
    return InventoryItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },

  async list({ search, category, lowStockOnly, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (lowStockOnly) {
      filter.$expr = { $lte: ['$quantityInStock', '$reorderLevel'] };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      InventoryItem.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      InventoryItem.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },
};

module.exports = inventoryRepository;
