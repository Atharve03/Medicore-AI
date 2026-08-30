const mongoose = require('mongoose');

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: DAYS, required: true },
    startTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, 'startTime must be in HH:mm 24-hour format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [TIME_PATTERN, 'endTime must be in HH:mm 24-hour format'],
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    department: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    consultationFee: {
      type: Number,
      min: 0,
      default: null,
    },
    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },
  },
  { timestamps: true }
);

doctorSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    userId: this.userId,
    fullName: this.fullName,
    specialization: this.specialization,
    qualifications: this.qualifications,
    department: this.department,
    consultationFee: this.consultationFee,
    availability: this.availability,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = { Doctor, DAYS };
