const validate = require('../utils/validate');
const parseJsonFields = require('../middlewares/parseJsonFields');
const {
  createOrderSchema,
  submitResultsSchema,
  listByPatientQuerySchema,
} = require('../modules/laboratory/laboratory.validators');

function buildRes() {
  return {};
}

describe('laboratory validators', () => {
  it('accepts a valid lab order', () => {
    const req = {
      body: { patientId: '64f1a2b3c4d5e6f7a8b9c0d1', testType: 'Complete Blood Count' },
    };
    const next = jest.fn();

    validate(createOrderSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an order missing testType', () => {
    const req = { body: { patientId: '64f1a2b3c4d5e6f7a8b9c0d1' } };
    const next = jest.fn();

    validate(createOrderSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('accepts valid results with unit and referenceRange', () => {
    const req = {
      body: {
        results: [
          { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12-16' },
        ],
      },
    };
    const next = jest.fn();

    validate(submitResultsSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects empty results', () => {
    const req = { body: { results: [] } };
    const next = jest.fn();

    validate(submitResultsSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an invalid status filter', () => {
    const req = { query: { status: 'archived' } };
    const next = jest.fn();

    validate(listByPatientQuerySchema, 'query')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

describe('parseJsonFields middleware', () => {
  it('parses a JSON-encoded string field into a real array', () => {
    const req = {
      body: { results: JSON.stringify([{ parameter: 'Hemoglobin', value: '13.5' }]) },
    };
    const next = jest.fn();

    parseJsonFields('results')(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.results).toEqual([{ parameter: 'Hemoglobin', value: '13.5' }]);
  });

  it('leaves an already-parsed array untouched', () => {
    const original = [{ parameter: 'Hemoglobin', value: '13.5' }];
    const req = { body: { results: original } };
    const next = jest.fn();

    parseJsonFields('results')(req, buildRes(), next);

    expect(req.body.results).toBe(original);
  });

  it('forwards a 400 ApiError for malformed JSON', () => {
    const req = { body: { results: '{not valid json' } };
    const next = jest.fn();

    parseJsonFields('results')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
