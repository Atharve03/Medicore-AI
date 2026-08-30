const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const doctorService = require('./doctor.service');

const getMyProfile = asyncHandler(async (req, res) => {
  const result = await doctorService.getMyProfile(req.user.id);
  return new ApiResponse(200, result).send(res);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const result = await doctorService.updateMyProfile(req.user.id, req.body);
  return new ApiResponse(200, result, 'Profile updated successfully').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const result = await doctorService.getById(req.params.id);
  return new ApiResponse(200, result).send(res);
});

const listDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.listDoctors(req.query);
  return new ApiResponse(200, result).send(res);
});

module.exports = { getMyProfile, updateMyProfile, getById, listDoctors };
