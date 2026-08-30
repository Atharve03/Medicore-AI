const OTP_CONTENT = {
  registration: {
    subject: 'Verify your MediCore AI account',
    heading: 'Verify your email address',
    intro: 'Welcome to MediCore AI. Use this verification code to finish creating your account.',
  },
  login: {
    subject: 'Your MediCore AI sign-in code',
    heading: 'Secure sign-in verification',
    intro: 'Use this one-time code to complete your secure sign-in.',
  },
  password_reset: {
    subject: 'Reset your MediCore AI password',
    heading: 'Password reset verification',
    intro: 'Use this one-time code to continue resetting your password.',
  },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildOtpEmail({ purpose, code, expiryMinutes, recipientName }) {
  const content = OTP_CONTENT[purpose];
  if (!content) throw new Error(`Unsupported OTP email purpose: ${purpose}`);

  const safeCode = escapeHtml(code);
  const safeName = escapeHtml(recipientName || 'there');
  const expiry = Number(expiryMinutes);
  const text = [
    `Hello ${recipientName || 'there'},`,
    content.intro,
    `Your verification code is ${code}.`,
    `It expires in ${expiry} minutes.`,
    "If you did not request this, do not share the code and you can safely ignore this email.",
    'MediCore AI — Secure • Smart • Healthcare',
  ].join('\n\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(content.subject)}</title>
</head>
<body style="margin:0;background:#f3f8f8;font-family:Arial,Helvetica,sans-serif;color:#17313a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f8f8;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #d9e8e8;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#126a73;padding:24px 30px;color:#ffffff;">
          <div style="font-size:22px;font-weight:700;letter-spacing:.2px;">MediCore <span style="color:#7de3d4;">AI</span></div>
          <div style="margin-top:5px;font-size:13px;color:#d9f2ef;">Secure healthcare access</div>
        </td></tr>
        <tr><td style="padding:32px 30px;">
          <p style="margin:0 0 12px;font-size:15px;">Hello ${safeName},</p>
          <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#17313a;">${escapeHtml(content.heading)}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#526b72;">${escapeHtml(content.intro)}</p>
          <div style="margin:0 auto 22px;padding:18px;text-align:center;background:#edf8f6;border:1px solid #bfe4dd;border-radius:12px;">
            <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#54777b;">One-time verification code</div>
            <div style="margin-top:8px;font-family:Consolas,Monaco,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:#126a73;">${safeCode}</div>
          </div>
          <p style="margin:0 0 20px;text-align:center;font-size:14px;color:#526b72;">This code expires in <strong>${expiry} minutes</strong>.</p>
          <div style="padding:14px 16px;background:#fff8e8;border-left:4px solid #e9a23b;border-radius:7px;font-size:13px;line-height:1.55;color:#6d552f;">
            <strong>Security notice:</strong> Never share this code. MediCore AI staff will never ask you for it. If you did not request this email, you can safely ignore it.
          </div>
        </td></tr>
        <tr><td style="padding:20px 30px;text-align:center;background:#f7fbfb;border-top:1px solid #e3eeee;font-size:12px;color:#668087;">
          MediCore AI — Secure • Smart • Healthcare<br>
          <span style="display:inline-block;margin-top:5px;">This is an automated security message.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: content.subject, text, html };
}

module.exports = { buildOtpEmail, escapeHtml };
