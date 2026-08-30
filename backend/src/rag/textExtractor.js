const ApiError = require('../utils/ApiError');

const SUPPORTED_TYPES = new Set(['text/plain', 'text/markdown', 'application/json']);

function extractText({ content, mimeType = 'text/plain' }) {
  if (!SUPPORTED_TYPES.has(mimeType)) {
    throw ApiError.badRequest(`Unsupported knowledge document type: ${mimeType}`);
  }
  const text = String(content || '').replace(/\u0000/g, '').trim();
  if (!text) throw ApiError.badRequest('Knowledge document content cannot be empty');
  return text;
}

module.exports = { extractText, SUPPORTED_TYPES };
