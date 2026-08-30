const { buildOtpEmail } = require('../utils/emailTemplates');

describe('professional OTP email templates', () => {
  test.each([
    ['registration', 'Verify your MediCore AI account'],
    ['login', 'Your MediCore AI sign-in code'],
    ['password_reset', 'Reset your MediCore AI password'],
  ])('builds the branded %s template', (purpose, subject) => {
    const email = buildOtpEmail({
      purpose,
      code: '482913',
      expiryMinutes: 10,
      recipientName: 'Jane Patient',
    });

    expect(email.subject).toBe(subject);
    expect(email.text).toContain('482913');
    expect(email.text).toContain('10 minutes');
    expect(email.html).toContain('482913');
    expect(email.html).toContain('10 minutes');
    expect(email.html).toContain('MediCore AI');
    expect(email.html).toContain('Secure • Smart • Healthcare');
    expect(email.html).toContain('Never share this code');
    expect(email.html).toContain('viewport');
  });

  it('escapes recipient content before inserting it into HTML', () => {
    const email = buildOtpEmail({
      purpose: 'login',
      code: '123456',
      expiryMinutes: 10,
      recipientName: '<script>alert(1)</script>',
    });

    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });

  it('rejects unknown OTP purposes instead of sending generic content', () => {
    expect(() =>
      buildOtpEmail({ purpose: 'unknown', code: '123456', expiryMinutes: 10 })
    ).toThrow(/Unsupported OTP email purpose/);
  });
});
