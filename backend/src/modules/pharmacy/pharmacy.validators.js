const Joi = require('joi');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const objectId = (label) =>
  Joi.string()
    .pattern(OBJECT_ID_PATTERN)
    .required()
    .messages({ 'string.pattern.base': `Invalid ${label}` });

const createMedicineSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  genericName: Joi.string().trim().max(150).allow(''),
  manufacturer: Joi.string().trim().max(150).allow(''),
  category: Joi.string().trim().max(100).allow(''),
  unitPrice: Joi.number().min(0).required(),
  stockQuantity: Joi.number().integer().min(0),
  reorderLevel: Joi.number().integer().min(0),
  expiryDate: Joi.date().greater('now'),
});

const updateMedicineSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  genericName: Joi.string().trim().max(150).allow(''),
  manufacturer: Joi.string().trim().max(150).allow(''),
  category: Joi.string().trim().max(100).allow(''),
  unitPrice: Joi.number().min(0),
  stockQuantity: Joi.number().integer().min(0),
  reorderLevel: Joi.number().integer().min(0),
  expiryDate: Joi.date().greater('now').allow(null),
}).min(1);

const listMedicinesQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  category: Joi.string().trim().max(100),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const medicineIdParamSchema = Joi.object({
  id: objectId('medicine id'),
});

const dispenseSchema = Joi.object({
  prescriptionId: objectId('prescriptionId'),
  items: Joi.array()
    .items(
      Joi.object({
        medicineId: objectId('medicineId'),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

const listOrdersQuerySchema = Joi.object({
  patientId: Joi.string().pattern(OBJECT_ID_PATTERN),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

module.exports = {
  createMedicineSchema,
  updateMedicineSchema,
  listMedicinesQuerySchema,
  medicineIdParamSchema,
  dispenseSchema,
  listOrdersQuerySchema,
};
