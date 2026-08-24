const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return new ApiResponse(201, result, 'Account created successfully').send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return new ApiResponse(200, result, 'Logged in successfully').send(res);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  return new ApiResponse(200, result, 'Token refreshed successfully').send(res);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const me = asyncHandler(async (req, res) => {
  const result = await authService.me(req.user.id);
  return new ApiResponse(200, result).send(res);
});

module.exports = { register, login, refresh, logout, me };
