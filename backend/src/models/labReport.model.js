const mongoose = require('mongoose');

const STATUSES = ['ordered', 'inProgress', 'completed'];

const resultEntrySchema = new mongoose.Schema(
  {
    parameter: { type: String, required: true, trim: true, maxlength: 120 },
    value: { type: String, required: true, trim: true, maxlength: 60 },
    unit: { type: String, trim: true, maxlength: 30, default: null },
    referenceRange: { type: String, trim: true, maxlength: 60, default: null },
  },
  { _id: false }
);

const labReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    testType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    orderedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    resultAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'ordered',
    },
    results: {
      type: [resultEntrySchema],
      default: [],
    },
    reportFileUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

labReportSchema.index({ patientId: 1, resultAt: -1 });

labReportSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    patientId: this.patientId,
    doctorId: this.doctorId,
    testType: this.testType,
    orderedAt: this.orderedAt,
    resultAt: this.resultAt,
    status: this.status,
    results: this.results,
    reportFileUrl: this.reportFileUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const LabReport = mongoose.model('LabReport', labReportSchema);

module.exports = { LabReport, STATUSES };
