const Joi = require('joi');
const { STATUSES } = require('../../models/labReport.model');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const createOrderSchema = Joi.object({
  patientId: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
  testType: Joi.string().trim().min(2).max(120).required(),
});

const resultEntrySchema = Joi.object({
  parameter: Joi.string().trim().max(120).required(),
  value: Joi.string().trim().max(60).required(),
  unit: Joi.string().trim().max(30).allow(''),
  referenceRange: Joi.string().trim().max(60).allow(''),
});

const submitResultsSchema = Joi.object({
  results: Joi.array().items(resultEntrySchema).min(1).required(),
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

const orderIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': 'Invalid lab order id' }),
});

module.exports = {
  createOrderSchema,
  submitResultsSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  orderIdParamSchema,
};
