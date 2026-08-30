const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return new ApiResponse(201, result, 'Verification code sent to your email').send(res);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return new ApiResponse(200, result, 'Verification code sent to your email').send(res);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);
  return new ApiResponse(200, result, 'Verified successfully').send(res);
});

const resendOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body);
  return new ApiResponse(200, result, 'Verification code sent').send(res);
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

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  return new ApiResponse(
    200,
    null,
    'If an active account exists for that email, a reset code has been sent'
  ).send(res);
});

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyForgotPasswordOtp(req.body);
  return new ApiResponse(200, result, 'Verification successful').send(res);
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return new ApiResponse(200, null, 'Password reset successfully.').send(res);
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return new ApiResponse(200, null, 'Password changed successfully. Please sign in again.').send(res);
});

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtp,
  refresh,
  logout,
  me,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  changePassword,
};
