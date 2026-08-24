/**
 * Creates the first admin account so you can log in and use the Admin
 * dashboard's "Create account" to provision doctors, receptionists, etc.
 * Safe to re-run — it exits cleanly if an admin with this email already
 * exists rather than erroring or creating a duplicate.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *   node scripts/seedAdmin.js --email admin@medicore.ai --password ChangeMe123! --name "Hospital Admin"
 *
 * Reads MONGO_URI from .env like the rest of the app.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const { User } = require('../src/models/user.model');

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
  };
  return {
    email: get('--email', 'admin@medicore.ai'),
    password: get('--password', 'Admin@12345'),
    fullName: get('--name', 'Hospital Admin'),
  };
}

async function seedAdmin() {
  const { email, password, fullName } = parseArgs();

  await mongoose.connect(env.mongoUri);
  console.log(`Connected to ${env.mongoUri}`);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account with ${email} already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await User.hashPassword(password);
  const admin = await User.create({
    fullName,
    email,
    passwordHash,
    role: 'admin',
  });

  console.log('Admin account created:');
  console.log(`  email:    ${admin.email}`);
  console.log(`  password: ${password}`);
  console.log('Log in with these, then use Admin -> Users -> Create account to add doctors and staff.');

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err.message);
  process.exit(1);
});
