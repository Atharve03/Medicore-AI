const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const doctorRepository = require('../../repositories/doctor.repository');

async function getMyProfile(userId) {
  const doctor = await doctorRepository.findByUserId(userId);
  if (!doctor) {
    throw ApiError.notFound('Doctor profile not found');
  }
  return doctor.toClientJSON();
}

async function updateMyProfile(userId, updates) {
  const doctor = await doctorRepository.updateByUserId(userId, updates);
  if (!doctor) {
    throw ApiError.notFound('Doctor profile not found');
  }
  return doctor.toClientJSON();
}

async function getById(id) {
  const doctor = await doctorRepository.findById(id);
  if (!doctor) {
    throw ApiError.notFound('Doctor not found');
  }
  return doctor.toClientJSON();
}

async function listDoctors(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await doctorRepository.list({
    search: query.search,
    department: query.department,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((d) => d.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { getMyProfile, updateMyProfile, getById, listDoctors };
