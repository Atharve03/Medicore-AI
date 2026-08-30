const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter = null;

function isConfigured() {
  // Tests must never send real email even if a developer's local .env contains credentials.
  return env.nodeEnv !== 'test' && Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

function getTransporter() {
  if (!isConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs and no-ops. Never
 * throws — a failed or skipped email must never break the caller's flow
 * (e.g. creating an in-app notification), so errors are caught and logged.
 */
async function sendEmail({ to, subject, text, html }) {
  const client = getTransporter();
  if (!client) {
    logger.warn(`SMTP not configured — skipping email to ${to}: "${subject}"`);
    return { sent: false };
  }

  try {
    await client.sendMail({ from: env.smtp.user, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendEmail, isConfigured };
