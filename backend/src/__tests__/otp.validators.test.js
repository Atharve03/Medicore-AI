const validate = require('../utils/validate');
const { verifyOtpSchema, resendOtpSchema } = require('../modules/auth/auth.validators');

function buildRes() {
  return {};
}

describe('OTP auth validators', () => {
  describe('verifyOtpSchema', () => {
    it('accepts a valid 6-digit code with a valid purpose', () => {
      const req = { body: { email: 'a@b.com', code: '123456', purpose: 'registration' } };
      const next = jest.fn();

      validate(verifyOtpSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a code that is not 6 digits', () => {
      const req = { body: { email: 'a@b.com', code: '12345', purpose: 'login' } };
      const next = jest.fn();

      validate(verifyOtpSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rejects an invalid purpose', () => {
      const req = { body: { email: 'a@b.com', code: '123456', purpose: 'reset' } };
      const next = jest.fn();

      validate(verifyOtpSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('resendOtpSchema', () => {
    it('accepts a valid resend request', () => {
      const req = { body: { email: 'a@b.com', purpose: 'login' } };
      const next = jest.fn();

      validate(resendOtpSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a missing purpose', () => {
      const req = { body: { email: 'a@b.com' } };
      const next = jest.fn();

      validate(resendOtpSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
});
