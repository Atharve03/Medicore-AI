jest.mock('../config/redis', () => ({ del: jest.fn(), set: jest.fn(), get: jest.fn() }));
jest.mock('../repositories/user.repository');
jest.mock('../repositories/patient.repository');
jest.mock('../repositories/doctor.repository');
jest.mock('../utils/mailer', () => ({ sendEmail: jest.fn().mockResolvedValue({ sent: true }) }));

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const redisClient = require('../config/redis');
const userRepository = require('../repositories/user.repository');
const { signPasswordResetToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/mailer');
const authService = require('../modules/auth/auth.service');

function hashJti(jti) {
  return crypto.createHash('sha256').update(jti).digest('hex');
}

describe('password reset token lifecycle', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the existing mailer with branded HTML and never exposes the OTP in the result', async () => {
    userRepository.findByEmail.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      fullName: 'Jane Patient',
      email: 'jane@example.com',
      isActive: true,
      otp: null,
    });
    userRepository.setOtp.mockResolvedValue({});

    const result = await authService.forgotPassword({ email: 'jane@example.com' });

    expect(result).toBeNull();
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'jane@example.com',
      subject: 'Reset your MediCore AI password',
      html: expect.stringContaining('MediCore AI'),
      text: expect.stringContaining('verification code'),
    }));
  });

  it('accepts a matching unexpired token, updates the password, and revokes refresh state', async () => {
    const user = { _id: '507f1f77bcf86cd799439011', role: 'patient' };
    const { token, jti } = signPasswordResetToken(user);
    userRepository.findById.mockResolvedValue({
      ...user,
      isActive: true,
      passwordReset: { tokenHash: hashJti(jti), expiresAt: new Date(Date.now() + 60_000) },
      comparePassword: jest.fn().mockResolvedValue(false),
    });
    userRepository.updatePasswordAndClearReset.mockResolvedValue({});

    await authService.resetPassword({ resetToken: token, newPassword: 'NewPassword@2026' });

    expect(userRepository.updatePasswordAndClearReset).toHaveBeenCalledWith(user._id, 'NewPassword@2026');
    expect(redisClient.del).toHaveBeenCalledWith(`auth:refresh:${user._id}`);
  });

  it('rejects reuse after the stored single-use token has been cleared', async () => {
    const { token } = signPasswordResetToken({ _id: '507f1f77bcf86cd799439011', role: 'patient' });
    userRepository.findById.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      isActive: true,
      passwordReset: { tokenHash: null, expiresAt: null },
    });

    await expect(
      authService.resetPassword({ resetToken: token, newPassword: 'NewPassword@2026' })
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(userRepository.updatePasswordAndClearReset).not.toHaveBeenCalled();
  });

  it('rejects an expired signed reset token before accessing the account', async () => {
    const token = jwt.sign(
      { sub: '507f1f77bcf86cd799439011', jti: 'expired-jti', purpose: 'password_reset' },
      env.jwt.passwordResetSecret,
      { expiresIn: -1 }
    );

    await expect(
      authService.resetPassword({ resetToken: token, newPassword: 'NewPassword@2026' })
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(userRepository.findById).not.toHaveBeenCalled();
  });
});
