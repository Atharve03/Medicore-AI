const mongoose = require('mongoose');

const GENDERS = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20 },
    relation: { type: String, trim: true, maxlength: 60 },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
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
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: GENDERS,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: null,
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    emergencyContact: {
      type: emergencyContactSchema,
      default: null,
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

patientSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    userId: this.userId,
    fullName: this.fullName,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    bloodGroup: this.bloodGroup,
    contactNumber: this.contactNumber,
    address: this.address,
    emergencyContact: this.emergencyContact,
    allergies: this.allergies,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = { Patient, GENDERS, BLOOD_GROUPS };
