const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id ?? user.id), role: user.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

function signRefreshToken(user, jti = crypto.randomUUID()) {
  const token = jwt.sign(
    { sub: String(user._id ?? user.id), jti },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

function signPasswordResetToken(user, jti = crypto.randomUUID()) {
  const token = jwt.sign(
    { sub: String(user._id ?? user.id), jti, purpose: 'password_reset' },
    env.jwt.passwordResetSecret,
    { expiresIn: env.jwt.passwordResetExpiresIn }
  );
  return { token, jti };
}

function verifyPasswordResetToken(token) {
  return jwt.verify(token, env.jwt.passwordResetSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
};
