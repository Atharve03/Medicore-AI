class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message Human-readable error message
   * @param {object} [options]
   * @param {Array<{ field: string, message: string }>} [options.errors] Field-level validation errors
   * @param {boolean} [options.isOperational] Whether this is a known, expected error (vs a bug)
   * @param {string} [options.code] Optional machine-readable error code (e.g. 'EMAIL_NOT_VERIFIED')
   *   for clients that need to branch on error kind without parsing the message text.
   */
  constructor(statusCode, message, { errors = [], isOperational = true, code = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, { errors });
  }

  static unauthorized(message = 'Unauthorized', code = null) {
    return new ApiError(401, message, { code });
  }

  static forbidden(message = 'Forbidden', code = null) {
    return new ApiError(403, message, { code });
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, { isOperational: false });
  }
}

module.exports = ApiError;
