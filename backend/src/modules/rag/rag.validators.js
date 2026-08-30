const Joi = require('joi');

const ingestDocumentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  source: Joi.string().trim().min(1).max(500).required(),
  mimeType: Joi.string().valid('text/plain', 'text/markdown', 'application/json').default('text/plain'),
  content: Joi.string().min(20).max(800000).required(),
  metadata: Joi.object().unknown(true).default({}),
});

const listDocumentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const documentIdSchema = Joi.object({
  id: Joi.string().pattern(/^[a-f\d]{24}$/i).required().messages({
    'string.pattern.base': 'Invalid knowledge document id',
  }),
});

module.exports = { ingestDocumentSchema, listDocumentsSchema, documentIdSchema };
