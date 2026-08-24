const Joi = require('joi');
const { STATUSES } = require('../../models/admission.model');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const createAdmissionSchema = Joi.object({
  patientId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
  // Only required when a nurse admits on a doctor's behalf; a doctor's own
  // doctorId is always resolved server-side from their session (see
  // admission.service), never taken from the request body.
  doctorId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .messages({ 'string.pattern.base': 'Invalid doctorId' }),
  wardType: Joi.string().trim().min(2).max(100).required(),
  bedNumber: Joi.string().trim().min(1).max(30).required(),
  expectedDischargeAt: Joi.date().greater('now'),
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

const admissionIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid admission id' }),
});

module.exports = {
  createAdmissionSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  admissionIdParamSchema,
};
