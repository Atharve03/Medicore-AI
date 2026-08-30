const Joi = require('joi');
const { STATUSES, RELATED_TYPES } = require('../../models/invoice.model');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const objectId = (label) =>
  Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': `Invalid ${label}` });

const createInvoiceSchema = Joi.object({
  patientId: objectId('patientId'),
  relatedTo: Joi.object({
    type: Joi.string()
      .valid(...RELATED_TYPES)
      .required(),
    refId: objectId('relatedTo.refId'),
  }).required(),
  lineItems: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().trim().max(200).required(),
        amount: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
});

const payInvoiceSchema = Joi.object({
  amount: Joi.number().greater(0).required(),
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

const invoiceIdParamSchema = Joi.object({
  id: objectId('invoice id'),
});

module.exports = {
  createInvoiceSchema,
  payInvoiceSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  invoiceIdParamSchema,
};
