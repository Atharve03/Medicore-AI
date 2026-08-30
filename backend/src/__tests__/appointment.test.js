const validate = require('../utils/validate');
const {
  createAppointmentSchema,
  updateStatusSchema,
  listAllQuerySchema,
} = require('../modules/appointment/appointment.validators');
const {
  ALLOWED_TRANSITIONS,
  assertWithinDoctorAvailability,
} = require('../modules/appointment/appointment.service');

function buildRes() {
  return {};
}

describe('appointment validators', () => {
  it('accepts a valid booking payload with a future date', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const req = {
      body: {
        doctorId: '64f1a2b3c4d5e6f7a8b9c0d1',
        scheduledAt: future,
        reasonForVisit: 'Routine checkup',
      },
    };
    const next = jest.fn();

    validate(createAppointmentSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a scheduledAt in the past', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const req = {
      body: { doctorId: '64f1a2b3c4d5e6f7a8b9c0d1', scheduledAt: past },
    };
    const next = jest.fn();

    validate(createAppointmentSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an invalid status value', () => {
    const req = { body: { status: 'archived' } };
    const next = jest.fn();

    validate(updateStatusSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('accepts a valid listAll query with date range', () => {
    const req = {
      query: { status: 'confirmed', from: '2026-01-01', to: '2026-01-31' },
    };
    const next = jest.fn();

    validate(listAllQuerySchema, 'query')(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });
});

describe('appointment status transitions', () => {
  it('allows requested -> confirmed and requested -> cancelled', () => {
    expect(ALLOWED_TRANSITIONS.requested).toEqual(
      expect.arrayContaining(['confirmed', 'cancelled'])
    );
  });

  it('allows confirmed -> completed, cancelled, noShow', () => {
    expect(ALLOWED_TRANSITIONS.confirmed).toEqual(
      expect.arrayContaining(['completed', 'cancelled', 'noShow'])
    );
  });

  it('treats completed/cancelled/noShow as terminal', () => {
    expect(ALLOWED_TRANSITIONS.completed).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS.cancelled).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS.noShow).toHaveLength(0);
  });
});

describe('assertWithinDoctorAvailability', () => {
  const doctor = {
    availability: [{ day: 'mon', startTime: '09:00', endTime: '13:00' }],
  };

  it('does not throw for a time inside the slot', () => {
    // 2026-01-05 is a Monday
    const scheduledAt = new Date('2026-01-05T10:00:00');
    expect(() => assertWithinDoctorAvailability(doctor, scheduledAt)).not.toThrow();
  });

  it('throws for a time outside the slot on the same day', () => {
    const scheduledAt = new Date('2026-01-05T14:00:00');
    expect(() => assertWithinDoctorAvailability(doctor, scheduledAt)).toThrow();
  });

  it('throws for the right time on the wrong day', () => {
    // 2026-01-06 is a Tuesday
    const scheduledAt = new Date('2026-01-06T10:00:00');
    expect(() => assertWithinDoctorAvailability(doctor, scheduledAt)).toThrow();
  });

  it('throws when the doctor has no published availability', () => {
    const scheduledAt = new Date('2026-01-05T10:00:00');
    expect(() =>
      assertWithinDoctorAvailability({ availability: [] }, scheduledAt)
    ).toThrow();
  });
});
