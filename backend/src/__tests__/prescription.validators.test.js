const validate = require('../utils/validate');
const {
  createPrescriptionSchema,
  listByPatientQuerySchema,
  prescriptionIdParamSchema,
} = require('../modules/prescription/prescription.validators');

function buildRes() {
  return {};
}

describe('prescription validators', () => {
  it('accepts a valid prescription with one medicine', () => {
    const req = {
      body: {
        medicalRecordId: '64f1a2b3c4d5e6f7a8b9c0d1',
        medicines: [
          {
            medicineId: '64f1a2b3c4d5e6f7a8b9c0d2',
            dosage: '500mg',
            frequency: 'twice daily',
            durationDays: 5,
          },
        ],
      },
    };
    const next = jest.fn();

    validate(createPrescriptionSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a prescription with zero medicines', () => {
    const req = {
      body: { medicalRecordId: '64f1a2b3c4d5e6f7a8b9c0d1', medicines: [] },
    };
    const next = jest.fn();

    validate(createPrescriptionSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a medicine missing dosage', () => {
    const req = {
      body: {
        medicalRecordId: '64f1a2b3c4d5e6f7a8b9c0d1',
        medicines: [
          { medicineId: '64f1a2b3c4d5e6f7a8b9c0d2', frequency: 'daily', durationDays: 3 },
        ],
      },
    };
    const next = jest.fn();

    validate(createPrescriptionSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an invalid status filter', () => {
    const req = { query: { status: 'archived' } };
    const next = jest.fn();

    validate(listByPatientQuerySchema, 'query')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a malformed prescription id', () => {
    const req = { params: { id: 'bad-id' } };
    const next = jest.fn();

    validate(prescriptionIdParamSchema, 'params')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
