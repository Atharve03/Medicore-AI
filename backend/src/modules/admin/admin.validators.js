const Joi = require('joi');
const { ROLES } = require('../../models/user.model');
const { passwordSchema } = require('../../utils/passwordPolicy');

const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordSchema.required(),
  role: Joi.string()
    .valid(...ROLES)
    .required(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120),
  role: Joi.string().valid(...ROLES),
  isActive: Joi.boolean(),
}).min(1);

const listUsersQuerySchema = Joi.object({
  role: Joi.string().valid(...ROLES),
  search: Joi.string().trim().max(120),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const userIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid user id' }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
};
