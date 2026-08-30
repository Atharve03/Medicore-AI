const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const { authLimiter, otpLimiter } = require('../../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.validators');
const authController = require('./auth.controller');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

router.post('/login', authLimiter, validate(loginSchema), authController.login);

router.post(
  '/verify-otp',
  otpLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp
);

router.post(
  '/resend-otp',
  authLimiter,
  validate(resendOtpSchema),
  authController.resendOtp
);

router.post(
  '/refresh',
  authLimiter,
  validate(refreshSchema),
  authController.refresh
);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/verify-forgot-password-otp',
  otpLimiter,
  validate(verifyForgotPasswordOtpSchema),
  authController.verifyForgotPasswordOtp
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/change-password',
  authenticate,
  authLimiter,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
