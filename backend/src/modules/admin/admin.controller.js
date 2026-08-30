const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const adminService = require('./admin.service');

const createUser = asyncHandler(async (req, res) => {
  const result = await adminService.createUser(req.body, req.user);
  return new ApiResponse(201, result, 'User created successfully').send(res);
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query, req.user);
  return new ApiResponse(200, result).send(res);
});

const updateUser = asyncHandler(async (req, res) => {
  const result = await adminService.updateUser(
    req.params.id,
    req.body,
    req.user
  );
  return new ApiResponse(200, result, 'User updated successfully').send(res);
});

const deactivateUser = asyncHandler(async (req, res) => {
  const result = await adminService.deactivateUser(req.params.id, req.user);
  return new ApiResponse(200, result, 'User deactivated successfully').send(res);
});

const overview = asyncHandler(async (req, res) => {
  const result = await adminService.overview();
  return new ApiResponse(200, result).send(res);
});

module.exports = { createUser, listUsers, updateUser, deactivateUser, overview };
