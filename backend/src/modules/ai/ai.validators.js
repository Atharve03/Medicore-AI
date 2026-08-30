const Joi = require('joi');

const chatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
});

module.exports = { chatSchema };
