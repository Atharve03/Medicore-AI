const Joi = require('joi');
const { STATUSES } = require('../../models/prescription.model');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const objectId = (label) =>
  Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': `Invalid ${label}` });

const prescribedMedicineSchema = Joi.object({
  medicineId: objectId('medicineId'),
  dosage: Joi.string().trim().max(60).required(),
  frequency: Joi.string().trim().max(60).required(),
  durationDays: Joi.number().integer().min(1).max(365).required(),
});

const createPrescriptionSchema = Joi.object({
  medicalRecordId: objectId('medicalRecordId'),
  medicines: Joi.array().items(prescribedMedicineSchema).min(1).required(),
});

const listByPatientQuerySchema = Joi.object({
  status: Joi.string().valid(...STATUSES),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const patientIdParamSchema = Joi.object({
  patientId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
});

const prescriptionIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid prescription id' }),
});

module.exports = {
  createPrescriptionSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  prescriptionIdParamSchema,
};
