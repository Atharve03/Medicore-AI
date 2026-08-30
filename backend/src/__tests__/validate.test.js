const Joi = require('joi');
const validate = require('../utils/validate');
const { registerSchema } = require('../modules/auth/auth.validators');

function buildRes() {
  return {};
}

describe('validate middleware', () => {
  it('calls next() with no error and casts value on valid input', () => {
    const req = {
      body: {
        fullName: '  Jane Doe  ',
        email: 'JANE@Example.com',
        password: 'Supersecret@1',
        role: 'patient',
      },
    };
    const next = jest.fn();

    validate(registerSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.email).toBe('jane@example.com');
  });

  it('forwards a 400 ApiError with field details on invalid input', () => {
    const req = { body: { fullName: 'J', email: 'not-an-email' } };
    const next = jest.fn();

    validate(registerSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const errArg = next.mock.calls[0][0];
    expect(errArg.statusCode).toBe(400);
    expect(errArg.errors.length).toBeGreaterThan(0);
  });

  it('supports arbitrary schemas via validate(schema)', () => {
    const schema = Joi.object({ n: Joi.number().required() });
    const req = { body: { n: '42' } };
    const next = jest.fn();

    validate(schema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.n).toBe(42);
  });
});
