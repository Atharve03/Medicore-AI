const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const { authLimiter } = require('../../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
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
  '/refresh',
  authLimiter,
  validate(refreshSchema),
  authController.refresh
);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

module.exports = router;
