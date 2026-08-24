/**
 * Creates the very first admin account. This is the only way to get an
 * admin into an empty database — every other account-creation path
 * (POST /admin/users) requires already being logged in as one.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 *   node src/scripts/seedAdmin.js --email admin@medicore.ai --password ChangeMe123! --name "Hospital Admin"
 *
 * Safe to re-run: if an account with the given email already exists, the
 * script reports that and exits without creating a duplicate or touching
 * the existing account.
 */
const logger = require('../config/logger');
const { connectDB, disconnectDB } = require('../config/db');
const userRepository = require('../repositories/user.repository');

function parseArgs(argv) {
  const args = { email: 'admin@medicore.ai', password: 'ChangeMe123!', fullName: 'Hospital Admin' };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (key === 'email') args.email = value;
    if (key === 'password') args.password = value;
    if (key === 'name') args.fullName = value;
  }
  return args;
}

async function run() {
  const { email, password, fullName } = parseArgs(process.argv.slice(2));

  await connectDB();

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    logger.warn(`An account with email '${email}' already exists — nothing to do.`);
    await disconnectDB();
    process.exit(0);
  }

  const admin = await userRepository.create({ fullName, email, password, role: 'admin' });

  logger.info('Admin account created:');
  logger.info(`  email:    ${admin.email}`);
  logger.info(`  password: ${password}`);
  logger.info('Log in with these, then change the password and create your other accounts from Admin \u2192 Users.');

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
