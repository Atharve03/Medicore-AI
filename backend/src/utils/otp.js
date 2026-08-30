const crypto = require('crypto');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(crypto.randomInt(min, max + 1));
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function buildOtpRecord(code, purpose) {
  return {
    codeHash: hashCode(code),
    purpose,
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    attempts: 0,
    sentAt: new Date(),
  };
}

/**
 * Returns { valid: boolean, reason?: string }. Never throws — the caller
 * decides how to translate a failure into an HTTP response.
 */
function checkOtp(otpRecord, submittedCode, expectedPurpose) {
  if (!otpRecord || !otpRecord.codeHash) {
    return { valid: false, reason: 'No OTP was requested for this account' };
  }
  if (otpRecord.purpose !== expectedPurpose) {
    return { valid: false, reason: 'OTP purpose mismatch' };
  }
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    return { valid: false, reason: 'Too many incorrect attempts — request a new code' };
  }
  if (!otpRecord.expiresAt || otpRecord.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: 'This code has expired — request a new one' };
  }
  if (hashCode(submittedCode) !== otpRecord.codeHash) {
    return { valid: false, reason: 'Incorrect code' };
  }
  return { valid: true };
}

module.exports = {
  OTP_LENGTH,
  OTP_TTL_MINUTES,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_SECONDS,
  generateCode,
  buildOtpRecord,
  checkOtp,
};
