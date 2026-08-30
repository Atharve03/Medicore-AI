const redisClient = require('../../config/redis');
const crypto = require('crypto');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const parseDurationToSeconds = require('../../utils/parseDuration');
const {
  generateCode,
  buildOtpRecord,
  checkOtp,
  OTP_TTL_MINUTES,
  RESEND_COOLDOWN_SECONDS,
} = require('../../utils/otp');
const { sendEmail } = require('../../utils/mailer');
const { buildOtpEmail } = require('../../utils/emailTemplates');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} = require('../../utils/jwt');
const userRepository = require('../../repositories/user.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');
const { PUBLIC_ROLES } = require('./auth.validators');

const REFRESH_TTL_SECONDS = parseDurationToSeconds(env.jwt.refreshExpiresIn);

function refreshKey(userId) {
  return `auth:refresh:${userId}`;
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user);

  await redisClient.set(refreshKey(user._id), jti, 'EX', REFRESH_TTL_SECONDS);

  return { accessToken, refreshToken };
}

async function issueAndSendOtp(user, purpose) {
  const code = generateCode();
  await userRepository.setOtp(user._id, buildOtpRecord(code, purpose));

  const email = buildOtpEmail({
    purpose,
    code,
    expiryMinutes: OTP_TTL_MINUTES,
    recipientName: user.fullName,
  });

  // Never let a slow/failed email provider block the response — the code
  // is already saved, so verify-otp works regardless of email delivery,
  // and sendEmail itself never throws (see utils/mailer.js).
  await sendEmail({ to: user.email, ...email });
}

/**
 * Public self-registration accepts only PUBLIC_ROLES from the shared role
 * enum. `admin` is rejected by both validation and this service-level guard.
 *
 * No tokens are issued here — the account is created with
 * isEmailVerified: false and a registration OTP is emailed. The caller
 * must complete POST /auth/verify-otp (purpose: 'registration') to
 * receive tokens.
 */
async function register({ fullName, email, password, role }) {
  if (!PUBLIC_ROLES.includes(role)) {
    throw ApiError.forbidden('This role cannot be created through public signup');
  }
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await userRepository.create({
    fullName,
    email,
    password,
    role,
    isEmailVerified: false,
  });

  // Every patient user gets a linked Patient profile immediately, so
  // GET /patients/me always has a document to return; the patient fills in
  // the rest (DOB, blood group, contact info, ...) via PATCH /patients/me.
  if (role === 'patient') {
    await patientRepository.create({ userId: user._id, fullName });
  } else if (role === 'doctor') {
    await doctorRepository.create({ userId: user._id, fullName });
  }

  await issueAndSendOtp(user, 'registration');

  return { email: user.email, otpRequired: true, purpose: 'registration' };
}

/**
 * Validates credentials, then emails a login OTP instead of issuing tokens
 * directly — every login is effectively two-factor. An unverified email
 * can't proceed to a login OTP at all; it must finish registration
 * verification first (a fresh registration OTP is sent instead).
 */
async function login({ email, password }) {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    await issueAndSendOtp(user, 'registration');
    return { email: user.email, otpRequired: true, purpose: 'registration' };
  }

  await issueAndSendOtp(user, 'login');
  return { email: user.email, otpRequired: true, purpose: 'login' };
}

/**
 * Completes either flow: a 'registration' OTP marks the email verified and
 * then immediately proceeds to issue tokens (registration + first login in
 * one step); a 'login' OTP simply issues tokens. Either way this is the
 * only place tokens come from besides /auth/refresh.
 */
async function verifyOtp({ email, code, purpose }) {
  const user = await userRepository.findByEmail(email, { withOtp: true });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or code');
  }

  const result = checkOtp(user.otp, code, purpose);
  if (!result.valid) {
    await userRepository.incrementOtpAttempts(user._id);
    throw ApiError.badRequest(result.reason);
  }

  if (purpose === 'registration') {
    await userRepository.clearOtpAndVerifyEmail(user._id);
  } else {
    await userRepository.clearOtp(user._id);
  }

  await userRepository.updateLastLogin(user._id);
  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

async function resendOtp({ email, purpose }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.isActive) {
    // Don't reveal account existence either way.
    return { email, otpRequired: true, purpose };
  }

  // A 'login' resend for an unverified account should still send a
  // registration code — verification always comes first.
  const effectivePurpose = !user.isEmailVerified ? 'registration' : purpose;
  if (user.otp?.sentAt && Date.now() - user.otp.sentAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    throw ApiError.badRequest(`Please wait ${RESEND_COOLDOWN_SECONDS} seconds before requesting another code`);
  }
  await issueAndSendOtp(user, effectivePurpose);
  return { email: user.email, otpRequired: true, purpose: effectivePurpose };
}

async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const storedJti = await redisClient.get(refreshKey(payload.sub));
  if (!storedJti || storedJti !== payload.jti) {
    throw ApiError.unauthorized('Refresh token has been revoked or superseded');
  }

  const user = await userRepository.findById(payload.sub);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account not found or deactivated');
  }

  // Rotate: issuing a new pair invalidates the old refresh token's jti.
  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

async function logout(userId) {
  await redisClient.del(refreshKey(userId));
}

async function me(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.toSafeJSON();
}

function hashResetJti(jti) {
  return crypto.createHash('sha256').update(jti).digest('hex');
}

async function forgotPassword({ email }) {
  const user = await userRepository.findByEmail(email);
  if (user?.isActive) {
    const inCooldown =
      user.otp?.purpose === 'password_reset' &&
      user.otp?.sentAt &&
      Date.now() - user.otp.sentAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000;
    if (!inCooldown) await issueAndSendOtp(user, 'password_reset');
  }
  return null;
}

async function verifyForgotPasswordOtp({ email, otp }) {
  const user = await userRepository.findByEmail(email, { withOtp: true });
  if (!user?.isActive) throw ApiError.badRequest('Invalid or expired verification code');

  const result = checkOtp(user.otp, otp, 'password_reset');
  if (!result.valid) {
    await userRepository.incrementOtpAttempts(user._id);
    throw ApiError.badRequest(result.reason);
  }

  const { token, jti } = signPasswordResetToken(user);
  const decoded = verifyPasswordResetToken(token);
  await userRepository.clearOtp(user._id);
  await userRepository.setPasswordResetToken(user._id, {
    tokenHash: hashResetJti(jti),
    expiresAt: new Date(decoded.exp * 1000),
  });
  return { resetToken: token };
}

async function resetPassword({ resetToken, newPassword }) {
  let payload;
  try {
    payload = verifyPasswordResetToken(resetToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired password-reset token');
  }
  if (payload.purpose !== 'password_reset') {
    throw ApiError.unauthorized('Invalid password-reset token');
  }

  const user = await userRepository.findById(payload.sub, {
    withPassword: true,
    withResetToken: true,
  });
  const stored = user?.passwordReset;
  if (
    !user?.isActive ||
    !stored?.tokenHash ||
    stored.tokenHash !== hashResetJti(payload.jti) ||
    !stored.expiresAt ||
    stored.expiresAt.getTime() < Date.now()
  ) {
    throw ApiError.unauthorized('Invalid or expired password-reset token');
  }
  if (await user.comparePassword(newPassword)) {
    throw ApiError.badRequest('New password must differ from the current password');
  }

  await userRepository.updatePasswordAndClearReset(user._id, newPassword);
  await redisClient.del(refreshKey(user._id));
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId, { withPassword: true });
  if (!user?.isActive || !(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }
  if (await user.comparePassword(newPassword)) {
    throw ApiError.badRequest('New password must differ from the current password');
  }
  await userRepository.updatePassword(userId, newPassword);
  await redisClient.del(refreshKey(userId));
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  refresh,
  logout,
  me,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  changePassword,
};
