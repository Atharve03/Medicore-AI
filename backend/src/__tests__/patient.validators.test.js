const validate = require('../utils/validate');
const {
  updateProfileSchema,
  listPatientsQuerySchema,
  patientIdParamSchema,
} = require('../modules/patient/patient.validators');

function buildRes() {
  return {};
}

describe('patient validators', () => {
  describe('updateProfileSchema', () => {
    it('accepts a valid partial profile update', () => {
      const req = {
        body: {
          dateOfBirth: '1998-05-12',
          gender: 'female',
          bloodGroup: 'O+',
          contactNumber: '9876543210',
          emergencyContact: { name: 'Jane', phone: '1234567890', relation: 'Sister' },
          allergies: ['penicillin'],
        },
      };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body.bloodGroup).toBe('O+');
    });

    it('rejects an invalid blood group', () => {
      const req = { body: { bloodGroup: 'Z+' } };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });

    it('rejects an empty update body', () => {
      const req = { body: {} };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });

    it('rejects a future date of birth', () => {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const req = { body: { dateOfBirth: nextYear.toISOString() } };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });
  });

  describe('listPatientsQuerySchema', () => {
    it('casts page/limit to numbers', () => {
      const req = { query: { page: '2', limit: '10', search: 'jane' } };
      const next = jest.fn();

      validate(listPatientsQuerySchema, 'query')(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(10);
    });
  });

  describe('patientIdParamSchema', () => {
    it('accepts a valid Mongo ObjectId', () => {
      const req = { params: { id: '64f1a2b3c4d5e6f7a8b9c0d1' } };
      const next = jest.fn();

      validate(patientIdParamSchema, 'params')(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a malformed id', () => {
      const req = { params: { id: 'not-an-id' } };
      const next = jest.fn();

      validate(patientIdParamSchema, 'params')(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });
  });
});
