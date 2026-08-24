const ApiError = require('../utils/ApiError');

/**
 * multipart/form-data can't carry nested arrays/objects natively, so
 * clients send them as a JSON-encoded string field (e.g. `results` when a
 * report file is attached in the same request). This middleware parses
 * those fields back into real objects/arrays before validate() runs.
 * Fields that are already objects/arrays (plain JSON requests) are left
 * untouched.
 */
function parseJsonFields(...fields) {
  return function parseJsonFieldsMiddleware(req, res, next) {
    for (const field of fields) {
      const value = req.body[field];
      if (typeof value === 'string') {
        try {
          req.body[field] = JSON.parse(value);
        } catch (err) {
          return next(ApiError.badRequest(`Field '${field}' must be valid JSON`));
        }
      }
    }
    return next();
  };
}

module.exports = parseJsonFields;
