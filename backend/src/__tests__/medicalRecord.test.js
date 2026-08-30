const validate = require('../utils/validate');
const {
  createMedicalRecordSchema,
  patientIdParamSchema,
} = require('../modules/medicalRecord/medicalRecord.validators');
const { filesToAttachments } = require('../middlewares/upload');

function buildRes() {
  return {};
}

describe('medical record validators', () => {
  it('accepts a valid record with a single symptom coerced to an array', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        diagnosis: 'Seasonal allergy',
        symptoms: 'sneezing',
      },
    };
    const next = jest.fn();

    validate(createMedicalRecordSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.symptoms).toEqual(['sneezing']);
  });

  it('rejects a missing diagnosis', () => {
    const req = { body: { patientId: '64f1a2b3c4d5e6f7a8b9c0d1' } };
    const next = jest.fn();

    validate(createMedicalRecordSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a future visitDate', () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        diagnosis: 'Checkup',
        visitDate: nextYear.toISOString(),
      },
    };
    const next = jest.fn();

    validate(createMedicalRecordSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a malformed patientId param', () => {
    const req = { params: { patientId: 'not-an-id' } };
    const next = jest.fn();

    validate(patientIdParamSchema, 'params')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

describe('filesToAttachments', () => {
  it('returns an empty array when no files were uploaded', () => {
    expect(filesToAttachments(undefined, 'medical-records')).toEqual([]);
    expect(filesToAttachments([], 'medical-records')).toEqual([]);
  });

  it('maps multer file objects to { url, type }', () => {
    const files = [
      { filename: 'abc.png', mimetype: 'image/png' },
      { filename: 'def.pdf', mimetype: 'application/pdf' },
    ];

    expect(filesToAttachments(files, 'medical-records')).toEqual([
      { url: '/uploads/medical-records/abc.png', type: 'image/png' },
      { url: '/uploads/medical-records/def.pdf', type: 'application/pdf' },
    ]);
  });
});
