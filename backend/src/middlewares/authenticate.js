const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/user.model');

/**
 * Verifies the Bearer access token and attaches a minimal, trusted
 * req.user = { id, role } to the request. Does not hit the database on
 * every request except to confirm the account is still active, since role
 * changes/deactivation must take effect without waiting for token expiry.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired access token');
    }

    const user = await User.findById(payload.sub).select('role isActive');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account not found or deactivated');
    }

    req.user = { id: String(user._id), role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticate;
