const Joi = require('joi');

const listMineQuerySchema = Joi.object({
  isRead: Joi.boolean(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const notificationIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid notification id' }),
});

module.exports = { listMineQuerySchema, notificationIdParamSchema };
