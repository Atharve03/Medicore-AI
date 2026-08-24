const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    quantityInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      min: 0,
      default: 10,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    lastRestockedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

inventoryItemSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    unit: this.unit,
    quantityInStock: this.quantityInStock,
    reorderLevel: this.reorderLevel,
    location: this.location,
    lastRestockedAt: this.lastRestockedAt,
    lowStock: this.quantityInStock <= this.reorderLevel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = { InventoryItem };
