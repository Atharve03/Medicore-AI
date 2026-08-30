const Joi = require('joi');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const createMedicalRecordSchema = Joi.object({
  patientId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
  appointmentId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .allow(null, '')
    .messages({ 'string.pattern.base': 'Invalid appointmentId' }),
  visitDate: Joi.date().max('now'),
  symptoms: Joi.array().items(Joi.string().trim().max(120)).single(),
  diagnosis: Joi.string().trim().max(500).required(),
  notes: Joi.string().trim().max(2000).allow(''),
});

const listByPatientQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const patientIdParamSchema = Joi.object({
  patientId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
});

const recordIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid medical record id' }),
});

module.exports = {
  createMedicalRecordSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  recordIdParamSchema,
};
