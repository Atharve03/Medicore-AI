const mongoose = require('mongoose');

const STATUSES = ['active', 'dispensed', 'expired'];

// Note: `medicineId` refs the `Medicine` model, which is introduced in
// Phase 11 (Pharmacy Module). The reference is declared now, matching the
// DB design doc, but existence-validation against the pharmacy catalog and
// any `.populate('medicines.medicineId')` calls only become possible once
// that collection exists — see prescription.service.js and the Phase 9
// write-up for how this is handled until then.
const prescribedMedicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    dosage: { type: String, required: true, trim: true, maxlength: 60 },
    frequency: { type: String, required: true, trim: true, maxlength: 60 },
    durationDays: { type: Number, required: true, min: 1, max: 365 },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      required: true,
    },
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
    medicines: {
      type: [prescribedMedicineSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'A prescription must include at least one medicine',
      },
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'active',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });

prescriptionSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    medicalRecordId: this.medicalRecordId,
    patientId: this.patientId,
    doctorId: this.doctorId,
    medicines: this.medicines,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = { Prescription, STATUSES };
