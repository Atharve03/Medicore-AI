const { generateCode, buildOtpRecord, checkOtp, MAX_ATTEMPTS } = require('../utils/otp');

describe('otp utils', () => {
  it('generates a 6-digit numeric code', () => {
    const code = generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('accepts the correct code for the matching purpose', () => {
    const code = generateCode();
    const record = buildOtpRecord(code, 'registration');

    const result = checkOtp(record, code, 'registration');
    expect(result.valid).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const record = buildOtpRecord('123456', 'login');
    const result = checkOtp(record, '654321', 'login');
    expect(result.valid).toBe(false);
  });

  it('rejects a purpose mismatch', () => {
    const code = generateCode();
    const record = buildOtpRecord(code, 'registration');
    const result = checkOtp(record, code, 'login');
    expect(result.valid).toBe(false);
  });

  it('rejects an expired code', () => {
    const code = generateCode();
    const record = buildOtpRecord(code, 'login');
    record.expiresAt = new Date(Date.now() - 1000);

    const result = checkOtp(record, code, 'login');
    expect(result.valid).toBe(false);
  });

  it('rejects once attempts reach the max', () => {
    const code = generateCode();
    const record = buildOtpRecord(code, 'login');
    record.attempts = MAX_ATTEMPTS;

    const result = checkOtp(record, code, 'login');
    expect(result.valid).toBe(false);
  });

  it('rejects when no OTP was ever requested', () => {
    const result = checkOtp(null, '123456', 'login');
    expect(result.valid).toBe(false);
  });

  it('never stores the plaintext code', () => {
    const code = generateCode();
    const record = buildOtpRecord(code, 'registration');
    expect(record.codeHash).not.toBe(code);
    expect(record.codeHash).toHaveLength(64); // sha256 hex digest
  });
});
