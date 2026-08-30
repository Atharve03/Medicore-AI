const validate = require('../utils/validate');
const {
  updateProfileSchema,
  listDoctorsQuerySchema,
  doctorIdParamSchema,
} = require('../modules/doctor/doctor.validators');

function buildRes() {
  return {};
}

describe('doctor validators', () => {
  describe('updateProfileSchema', () => {
    it('accepts a valid partial profile update', () => {
      const req = {
        body: {
          specialization: 'Cardiology',
          department: 'Cardiology',
          consultationFee: 500,
          availability: [{ day: 'mon', startTime: '09:00', endTime: '13:00' }],
        },
      };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body.specialization).toBe('Cardiology');
    });

    it('rejects an availability slot where endTime is before startTime', () => {
      const req = {
        body: {
          availability: [{ day: 'mon', startTime: '14:00', endTime: '09:00' }],
        },
      };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });

    it('rejects a malformed time string', () => {
      const req = {
        body: {
          availability: [{ day: 'mon', startTime: '9am', endTime: '13:00' }],
        },
      };
      const next = jest.fn();

      validate(updateProfileSchema)(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });

    it('rejects a negative consultation fee', () => {
      const req = { body: { consultationFee: -10 } };
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
  });

  describe('listDoctorsQuerySchema', () => {
    it('casts page/limit and accepts department filter', () => {
      const req = { query: { page: '1', limit: '5', department: 'Cardiology' } };
      const next = jest.fn();

      validate(listDoctorsQuerySchema, 'query')(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect(req.query.page).toBe(1);
    });
  });

  describe('doctorIdParamSchema', () => {
    it('rejects a malformed id', () => {
      const req = { params: { id: 'bad-id' } };
      const next = jest.fn();

      validate(doctorIdParamSchema, 'params')(req, buildRes(), next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(400);
    });
  });
});
