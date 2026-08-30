const validate = require('../utils/validate');
const {
  createAdmissionSchema,
  listByPatientQuerySchema,
  admissionIdParamSchema,
} = require('../modules/admission/admission.validators');

function buildRes() {
  return {};
}

describe('admission validators', () => {
  it('accepts a valid admission payload from a doctor (no doctorId needed)', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        wardType: 'General Ward',
        bedNumber: 'G-12',
      },
    };
    const next = jest.fn();

    validate(createAdmissionSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('accepts a valid admission payload including doctorId (nurse case)', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        doctorId: '64f1a2b3c4d5e6f7a8b9c0d2',
        wardType: 'ICU',
        bedNumber: 'ICU-3',
      },
    };
    const next = jest.fn();

    validate(createAdmissionSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a missing bedNumber', () => {
    const req = {
      body: { patientId: '64f1a2b3c4d5e6f7a8b9c0d1', wardType: 'ICU' },
    };
    const next = jest.fn();

    validate(createAdmissionSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a past expectedDischargeAt', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        wardType: 'ICU',
        bedNumber: 'ICU-3',
        expectedDischargeAt: past,
      },
    };
    const next = jest.fn();

    validate(createAdmissionSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an invalid status filter', () => {
    const req = { query: { status: 'pending' } };
    const next = jest.fn();

    validate(listByPatientQuerySchema, 'query')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a malformed admission id', () => {
    const req = { params: { id: 'bad-id' } };
    const next = jest.fn();

    validate(admissionIdParamSchema, 'params')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
