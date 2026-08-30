const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });

medicalRecordSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    patientId: this.patientId,
    doctorId: this.doctorId,
    appointmentId: this.appointmentId,
    visitDate: this.visitDate,
    symptoms: this.symptoms,
    diagnosis: this.diagnosis,
    notes: this.notes,
    attachments: this.attachments,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = { MedicalRecord };
