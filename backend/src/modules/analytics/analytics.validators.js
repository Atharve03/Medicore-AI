const Joi = require('joi');

const dateRangeSchema = Joi.object({
  range: Joi.string().valid('today', 'yesterday', 'last7Days', 'last30Days', 'thisMonth', 'lastMonth'),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
}).custom((value, helpers) => {
  if ((value.from && !value.to) || (!value.from && value.to)) return helpers.error('any.custom');
  if (value.from && new Date(value.from) > new Date(value.to)) return helpers.error('date.order');
  if (value.from && new Date(value.to) - new Date(value.from) > 366 * 86400000) return helpers.error('date.range');
  return value;
}).messages({
  'any.custom': 'from and to must be supplied together',
  'date.order': 'from must be before or equal to to',
  'date.range': 'date range cannot exceed 366 days',
});

module.exports = { dateRangeSchema };
