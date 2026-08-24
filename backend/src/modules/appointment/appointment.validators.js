const Joi = require('joi');
const { STATUSES } = require('../../models/appointment.model');

const createAppointmentSchema = Joi.object({
  doctorId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid doctorId' }),
  // Only required when a receptionist books on a patient's behalf; a
  // patient's own patientId is always resolved server-side from their
  // session, never taken from the request body (see appointment.service).
  patientId: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .messages({ 'string.pattern.base': 'Invalid patientId' }),
  scheduledAt: Joi.date().greater('now').required().messages({
    'date.greater': 'scheduledAt must be in the future',
  }),
  reasonForVisit: Joi.string().trim().max(300).allow('').optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .required(),
});

const listMineQuerySchema = Joi.object({
  status: Joi.string().valid(...STATUSES),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const listAllQuerySchema = Joi.object({
  doctorId: Joi.string().pattern(/^[a-f\d]{24}$/i),
  patientId: Joi.string().pattern(/^[a-f\d]{24}$/i),
  status: Joi.string().valid(...STATUSES),
  from: Joi.date(),
  to: Joi.date(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const appointmentIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid appointment id' }),
});

module.exports = {
  createAppointmentSchema,
  updateStatusSchema,
  listMineQuerySchema,
  listAllQuerySchema,
  appointmentIdParamSchema,
};
