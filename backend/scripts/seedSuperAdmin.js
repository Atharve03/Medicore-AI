require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const env = require('../src/config/env');
const { User } = require('../src/models/user.model');
const { passwordSchema, PASSWORD_MESSAGE } = require('../src/utils/passwordPolicy');

function value(flag, envName) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : process.env[envName];
}

async function run() {
  const email = value('--email', 'SUPER_ADMIN_EMAIL');
  const resetViaEmail = process.argv.includes('--reset-via-email');
  const password = process.env.SUPER_ADMIN_PASSWORD || (resetViaEmail ? `${crypto.randomBytes(24).toString('base64url')}Aa1!` : null);
  const fullName = value('--name', 'SUPER_ADMIN_NAME') || 'MediCore Super Admin';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Provide a valid --email or SUPER_ADMIN_EMAIL');
  if (!password) throw new Error('Set SUPER_ADMIN_PASSWORD in the current shell or use --reset-via-email; it will never be printed');
  if (passwordSchema.validate(password).error) throw new Error(PASSWORD_MESSAGE);
  await mongoose.connect(env.mongoUri);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== 'superAdmin') throw new Error('That email already belongs to a non-super-admin account');
    console.log('Super-admin account already exists. Nothing changed.');
    return;
  }
  await User.create({ fullName, email, passwordHash: await User.hashPassword(password), role: 'superAdmin', isActive: true, isEmailVerified: true });
  console.log(resetViaEmail ? 'Super-admin account created. Use Forgot Password with this email to set its first password.' : 'Super-admin account created successfully. The password was not printed.');
}

run().catch(error => { console.error(`Super-admin bootstrap failed: ${error.message}`); process.exitCode = 1; }).finally(() => mongoose.disconnect());
