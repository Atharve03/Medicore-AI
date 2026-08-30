const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    genericName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
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
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

medicineSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    name: this.name,
    genericName: this.genericName,
    manufacturer: this.manufacturer,
    category: this.category,
    unitPrice: this.unitPrice,
    stockQuantity: this.stockQuantity,
    reorderLevel: this.reorderLevel,
    expiryDate: this.expiryDate,
    lowStock: this.stockQuantity <= this.reorderLevel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = { Medicine };
