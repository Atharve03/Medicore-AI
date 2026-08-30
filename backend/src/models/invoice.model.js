const mongoose = require('mongoose');

const STATUSES = ['pending', 'partiallyPaid', 'paid', 'void'];
const RELATED_TYPES = ['appointment', 'admission', 'pharmacyOrder', 'lab'];

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const relatedToSchema = new mongoose.Schema(
  {
    type: { type: String, enum: RELATED_TYPES, required: true },
    // Deliberately a plain ObjectId with no `ref` — it can point at any one
    // of four different collections depending on `type`, so a single
    // Mongoose ref/populate target doesn't apply. Resolve manually by type
    // if the referenced document is ever needed.
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    relatedTo: {
      type: relatedToSchema,
      required: true,
    },
    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'An invoice must include at least one line item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ patientId: 1, createdAt: -1 });

invoiceSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    patientId: this.patientId,
    relatedTo: this.relatedTo,
    lineItems: this.lineItems,
    totalAmount: this.totalAmount,
    paidAmount: this.paidAmount,
    balanceDue: Math.max(0, this.totalAmount - this.paidAmount),
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = { Invoice, STATUSES, RELATED_TYPES };
