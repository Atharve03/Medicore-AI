const mongoose = require('mongoose');

const STATUSES = ['admitted', 'discharged'];

const admissionSchema = new mongoose.Schema(
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
    wardType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    bedNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    admittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDischargeAt: {
      type: Date,
      default: null,
    },
    dischargedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'admitted',
    },
  },
  { timestamps: true }
);

admissionSchema.index({ patientId: 1, admittedAt: -1 });
admissionSchema.index({ admittedAt: -1, status: 1 });
// Used to check bed availability: is any *currently admitted* patient
// already occupying this ward/bed combination.
admissionSchema.index({ wardType: 1, bedNumber: 1, status: 1 });

admissionSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    patientId: this.patientId,
    doctorId: this.doctorId,
    wardType: this.wardType,
    bedNumber: this.bedNumber,
    admittedAt: this.admittedAt,
    expectedDischargeAt: this.expectedDischargeAt,
    dischargedAt: this.dischargedAt,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = { Admission, STATUSES };
