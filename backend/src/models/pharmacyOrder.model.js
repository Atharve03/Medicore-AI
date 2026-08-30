const mongoose = require('mongoose');

const dispensedItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    // Snapshotted from Medicine.unitPrice at dispense time, so a later
    // price change never rewrites the historical cost of a past order.
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const pharmacyOrderSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    // References the pharmacist's User document directly — no dedicated
    // Staff profile module exists in this build (see Phase 11 write-up),
    // so the acting user's identity is the source of truth here.
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [dispensedItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'A pharmacy order must include at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dispensedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

pharmacyOrderSchema.index({ patientId: 1, dispensedAt: -1 });

pharmacyOrderSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    prescriptionId: this.prescriptionId,
    patientId: this.patientId,
    dispensedBy: this.dispensedBy,
    items: this.items,
    totalAmount: this.totalAmount,
    dispensedAt: this.dispensedAt,
    createdAt: this.createdAt,
  };
};

const PharmacyOrder = mongoose.model('PharmacyOrder', pharmacyOrderSchema);

module.exports = { PharmacyOrder };
