const Joi = require('joi');

const PASSWORD_MESSAGE =
  'Password must be 8-128 characters and include uppercase, lowercase, number, and special character';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.min': PASSWORD_MESSAGE,
    'string.max': PASSWORD_MESSAGE,
    'string.pattern.name': PASSWORD_MESSAGE,
  });

module.exports = { passwordSchema, PASSWORD_MESSAGE };
