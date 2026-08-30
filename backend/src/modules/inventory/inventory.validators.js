const Joi = require('joi');

const createItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  category: Joi.string().trim().max(100).allow(''),
  unit: Joi.string().trim().min(1).max(30).required(),
  quantityInStock: Joi.number().integer().min(0),
  reorderLevel: Joi.number().integer().min(0),
  location: Joi.string().trim().max(150).allow(''),
});

const updateItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  category: Joi.string().trim().max(100).allow(''),
  unit: Joi.string().trim().min(1).max(30),
  quantityInStock: Joi.number().integer().min(0),
  reorderLevel: Joi.number().integer().min(0),
  location: Joi.string().trim().max(150).allow(''),
}).min(1);

const listItemsQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  category: Joi.string().trim().max(100),
  lowStockOnly: Joi.boolean(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

const itemIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .required()
    .messages({ 'string.pattern.base': 'Invalid inventory item id' }),
});

module.exports = {
  createItemSchema,
  updateItemSchema,
  listItemsQuerySchema,
  itemIdParamSchema,
};
