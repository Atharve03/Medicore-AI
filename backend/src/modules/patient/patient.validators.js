const Joi = require('joi');
const { GENDERS, BLOOD_GROUPS } = require('../../models/patient.model');

const emergencyContactSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  phone: Joi.string().trim().max(20).required(),
  relation: Joi.string().trim().max(60).required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120),
  dateOfBirth: Joi.date().max('now'),
  gender: Joi.string().valid(...GENDERS),
  bloodGroup: Joi.string().valid(...BLOOD_GROUPS),
  contactNumber: Joi.string().trim().max(20),
  address: Joi.string().trim().max(300),
  emergencyContact: emergencyContactSchema,
  allergies: Joi.array().items(Joi.string().trim().max(80)),
}).min(1);

const listPatientsQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const patientIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid patient id' }),
});

module.exports = {
  updateProfileSchema,
  listPatientsQuerySchema,
  patientIdParamSchema,
};
