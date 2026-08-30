const mongoose = require('mongoose');

const STATUSES = ['requested', 'confirmed', 'completed', 'cancelled', 'noShow'];

const appointmentSchema = new mongoose.Schema(
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
    scheduledAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'requested',
    },
    reasonForVisit: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
appointmentSchema.index({ patientId: 1, scheduledAt: -1 });
appointmentSchema.index({ scheduledAt: -1, status: 1 });

appointmentSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    patientId: this.patientId,
    doctorId: this.doctorId,
    scheduledAt: this.scheduledAt,
    status: this.status,
    reasonForVisit: this.reasonForVisit,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = { Appointment, STATUSES };
