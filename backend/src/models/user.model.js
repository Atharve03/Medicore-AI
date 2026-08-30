const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = [
  'superAdmin',
  'admin',
  'doctor',
  'patient',
  'receptionist',
  'nurse',
  'pharmacist',
  'labTechnician',
];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
      default: 'patient',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // A single active OTP at a time — requesting a new one overwrites this.
    // codeHash is a SHA-256 hash, never the raw code; attempts is reset on
    // every new code issue and increments only on a failed verify.
    otp: {
      codeHash: { type: String, default: null, select: false },
      purpose: { type: String, enum: ['registration', 'login', 'password_reset'], default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      sentAt: { type: Date, default: null },
    },
    passwordReset: {
      tokenHash: { type: String, default: null, select: false },
      expiresAt: { type: Date, default: null },
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

userSchema.statics.hashPassword = function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };
