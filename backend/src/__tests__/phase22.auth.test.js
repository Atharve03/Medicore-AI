const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../modules/auth/auth.validators');
const { buildOtpRecord, checkOtp } = require('../utils/otp');

describe('Phase 22 authentication policy', () => {
  const valid = {
    fullName: 'Jane Patient',
    email: 'jane@example.com',
    password: 'MediCore@2026',
    role: 'patient',
  };

  it('accepts a strong password and public role', () => {
    expect(registerSchema.validate(valid).error).toBeUndefined();
  });

  it('rejects public admin registration', () => {
    expect(registerSchema.validate({ ...valid, role: 'admin' }).error).toBeDefined();
    expect(registerSchema.validate({ ...valid, role: 'superAdmin' }).error).toBeDefined();
  });

  test.each([
    'Sh@1',
    'medicore@2026',
    'MEDICORE@2026',
    'MediCore@Only',
    'MediCore2026',
  ])('rejects weak password %s', (password) => {
    expect(registerSchema.validate({ ...valid, password }).error).toBeDefined();
  });

  it('strips a frontend-supplied role from login validation', () => {
    const { value, error } = loginSchema.validate(
      { email: valid.email, password: valid.password, role: 'admin' },
      { stripUnknown: true }
    );
    expect(error).toBeUndefined();
    expect(value.role).toBeUndefined();
  });

  it('requires matching strong reset and change passwords', () => {
    expect(resetPasswordSchema.validate({ resetToken: 'token', newPassword: valid.password, confirmPassword: valid.password }).error).toBeUndefined();
    expect(changePasswordSchema.validate({ currentPassword: 'old', newPassword: valid.password, confirmPassword: 'different' }).error).toBeDefined();
  });

  it('keeps password reset OTP separate from login OTP', () => {
    const record = buildOtpRecord('123456', 'password_reset');
    expect(checkOtp(record, '123456', 'login').valid).toBe(false);
    expect(checkOtp(record, '123456', 'password_reset').valid).toBe(true);
  });
});
