const ApiError = require('./ApiError');

/**
 * Returns an Express middleware that validates `req[property]` against a
 * Joi schema, replacing it with the validated/cast value on success and
 * forwarding a normalized 400 ApiError on failure.
 *
 * @param {import('joi').Schema} schema
 * @param {'body'|'params'|'query'} [property]
 */
function validate(schema, property = 'body') {
  return function validateMiddleware(req, res, next) {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }

    req[property] = value;
    return next();
  };
}

module.exports = validate;
