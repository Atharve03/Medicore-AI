const redisClient = require('../../config/redis');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const userRepository = require('../../repositories/user.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

/**
 * Admins provision every non-patient account (doctor, nurse, receptionist,
 * pharmacist, labTechnician, and even other admins). Patients normally
 * self-register via /auth/register, but if an admin creates a `patient`
 * role here too (e.g. registering a walk-in on their behalf), the linked
 * Patient profile is created the same way so no patient user is ever left
 * without one. Doctor accounts get the same treatment: a linked Doctor
 * profile is created immediately, with specialization/department/fee/
 * availability filled in afterwards via PATCH /doctors/me.
 */
async function createUser({ fullName, email, password, role }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await userRepository.create({ fullName, email, password, role });

  if (role === 'patient') {
    await patientRepository.create({ userId: user._id, fullName });
  } else if (role === 'doctor') {
    await doctorRepository.create({ userId: user._id, fullName });
  }

  return user.toSafeJSON();
}

async function listUsers(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await userRepository.list({
    role: query.role,
    search: query.search,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((u) => u.toSafeJSON()),
    total,
    page,
    limit,
  });
}

async function updateUser(id, updates, actingAdminId) {
  if (id === actingAdminId && updates.isActive === false) {
    throw ApiError.badRequest('An admin cannot deactivate their own account');
  }
  if (id === actingAdminId && updates.role && updates.role !== 'admin') {
    throw ApiError.badRequest('An admin cannot change their own role');
  }

  const user = await userRepository.updateById(id, updates);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (updates.isActive === false) {
    await redisClient.del(`auth:refresh:${id}`);
  }

  return user.toSafeJSON();
}

/**
 * Soft delete: deactivates the account and revokes its refresh token rather
 * than removing the document, since other collections (patients, doctors,
 * appointments, ...) reference this user by id in later phases.
 */
async function deactivateUser(id, actingAdminId) {
  if (id === actingAdminId) {
    throw ApiError.badRequest('An admin cannot deactivate their own account');
  }

  const user = await userRepository.setActive(id, false);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await redisClient.del(`auth:refresh:${id}`);
  return user.toSafeJSON();
}

async function overview() {
  const [byRole, byActiveStatus] = await Promise.all([
    userRepository.countByRole(),
    userRepository.countActiveInactive(),
  ]);

  const totalUsers = byRole.reduce((sum, r) => sum + r.count, 0);
  const active = byActiveStatus.find((s) => s.isActive === true)?.count || 0;
  const inactive = byActiveStatus.find((s) => s.isActive === false)?.count || 0;

  return {
    totalUsers,
    active,
    inactive,
    byRole,
    // Revenue, appointment volume, medicine usage, and department
    // performance are added here once their modules exist (Phases 7-13),
    // and get a dedicated richer view in Phase 23 (Analytics Dashboard).
  };
}

module.exports = { createUser, listUsers, updateUser, deactivateUser, overview };
