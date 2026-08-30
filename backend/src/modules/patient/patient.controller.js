const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const patientService = require('./patient.service');

const getMyProfile = asyncHandler(async (req, res) => {
  const result = await patientService.getMyProfile(req.user.id);
  return new ApiResponse(200, result).send(res);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const result = await patientService.updateMyProfile(req.user.id, req.body);
  return new ApiResponse(200, result, 'Profile updated successfully').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const result = await patientService.getById(req.params.id);
  return new ApiResponse(200, result).send(res);
});

const listPatients = asyncHandler(async (req, res) => {
  const result = await patientService.listPatients(req.query);
  return new ApiResponse(200, result).send(res);
});

module.exports = { getMyProfile, updateMyProfile, getById, listPatients };
