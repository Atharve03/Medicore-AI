const ApiError = require('../utils/ApiError');

/**
 * Usage: router.get('/admin/overview', authenticate, authorize('admin'), handler)
 * Must run AFTER authenticate() so req.user is populated.
 */
function authorize(...allowedRoles) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    const allowed = allowedRoles.includes(req.user.role) ||
      (req.user.role === 'superAdmin' && allowedRoles.includes('admin'));
    if (!allowed) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not permitted to access this resource`
        )
      );
    }
    return next();
  };
}

module.exports = authorize;
