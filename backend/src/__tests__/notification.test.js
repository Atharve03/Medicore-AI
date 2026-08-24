const validate = require('../utils/validate');
const {
  listMineQuerySchema,
  notificationIdParamSchema,
} = require('../modules/notification/notification.validators');
const { sendEmail, isConfigured } = require('../utils/mailer');

function buildRes() {
  return {};
}

describe('notification validators', () => {
  it('coerces isRead query string to a boolean', () => {
    const req = { query: { isRead: 'false' } };
    const next = jest.fn();

    validate(listMineQuerySchema, 'query')(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query.isRead).toBe(false);
  });

  it('rejects a malformed notification id', () => {
    const req = { params: { id: 'not-an-id' } };
    const next = jest.fn();

    validate(notificationIdParamSchema, 'params')(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

describe('mailer', () => {
  it('reports not configured when SMTP env vars are blank (default test env)', () => {
    expect(isConfigured()).toBe(false);
  });

  it('safely no-ops instead of throwing when SMTP is not configured', async () => {
    const result = await sendEmail({
      to: 'patient@example.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(result.sent).toBe(false);
  });
});
