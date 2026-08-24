const Joi = require('joi');
const { DAYS } = require('../../models/doctor.model');

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySlotSchema = Joi.object({
  day: Joi.string()
    .valid(...DAYS)
    .required(),
  startTime: Joi.string().pattern(TIME_PATTERN).required().messages({
    'string.pattern.base': 'startTime must be in HH:mm 24-hour format',
  }),
  endTime: Joi.string().pattern(TIME_PATTERN).required().messages({
    'string.pattern.base': 'endTime must be in HH:mm 24-hour format',
  }),
}).custom((value, helpers) => {
  if (value.startTime >= value.endTime) {
    return helpers.message('endTime must be after startTime');
  }
  return value;
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120),
  specialization: Joi.string().trim().max(120),
  qualifications: Joi.array().items(Joi.string().trim().max(120)),
  department: Joi.string().trim().max(120),
  consultationFee: Joi.number().min(0),
  availability: Joi.array().items(availabilitySlotSchema),
}).min(1);

const listDoctorsQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  department: Joi.string().trim().max(120),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const doctorIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid doctor id' }),
});

module.exports = {
  updateProfileSchema,
  listDoctorsQuerySchema,
  doctorIdParamSchema,
};
