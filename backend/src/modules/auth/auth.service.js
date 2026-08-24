const redisClient = require('../../config/redis');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const parseDurationToSeconds = require('../../utils/parseDuration');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const userRepository = require('../../repositories/user.repository');
const patientRepository = require('../../repositories/patient.repository');

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

/**
 * Public self-registration is intentionally restricted to the `patient`
 * role. Staff/doctor/admin accounts are provisioned by an admin via the
 * Admin module (Phase 4) so privileged roles can never be self-assigned.
 */
async function register({ fullName, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await userRepository.create({
    fullName,
    email,
    password,
    role: 'patient',
  });

  // Every patient user gets a linked Patient profile immediately, so
  // GET /patients/me always has a document to return; the patient fills in
  // the rest (DOB, blood group, contact info, ...) via PATCH /patients/me.
  await patientRepository.create({ userId: user._id, fullName });

  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email, { withPassword: true });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await userRepository.updateLastLogin(user._id);
  const tokens = await issueTokenPair(user);
  return { user: user.toSafeJSON(), ...tokens };
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

module.exports = { register, login, refresh, logout, me };
