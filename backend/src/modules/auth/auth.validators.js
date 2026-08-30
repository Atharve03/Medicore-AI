const Joi = require('joi');
const { ROLES } = require('../../models/user.model');
const { passwordSchema } = require('../../utils/passwordPolicy');

const PUBLIC_ROLES = ROLES.filter((role) => role !== 'admin');

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordSchema.required(),
  role: Joi.string().valid(...PUBLIC_ROLES).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Code must be 6 digits' }),
  purpose: Joi.string().valid('registration', 'login').required(),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  purpose: Joi.string().valid('registration', 'login').required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const verifyForgotPasswordOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP must be 6 digits',
  }),
});

const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: passwordSchema.required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema.required(),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  PUBLIC_ROLES,
};
