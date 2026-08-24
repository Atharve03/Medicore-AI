const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const patientRepository = require('../../repositories/patient.repository');

async function getMyProfile(userId) {
  const patient = await patientRepository.findByUserId(userId);
  if (!patient) {
    throw ApiError.notFound('Patient profile not found');
  }
  return patient.toClientJSON();
}

async function updateMyProfile(userId, updates) {
  const patient = await patientRepository.updateByUserId(userId, updates);
  if (!patient) {
    throw ApiError.notFound('Patient profile not found');
  }
  return patient.toClientJSON();
}

async function getById(id) {
  const patient = await patientRepository.findById(id);
  if (!patient) {
    throw ApiError.notFound('Patient not found');
  }
  return patient.toClientJSON();
}

async function listPatients(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await patientRepository.list({
    search: query.search,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((p) => p.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { getMyProfile, updateMyProfile, getById, listPatients };
