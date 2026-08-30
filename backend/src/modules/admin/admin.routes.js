const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} = require('./admin.validators');
const adminController = require('./admin.controller');

const router = express.Router();

// Every route in this module requires an authenticated admin.
router.use(authenticate, authorize('admin'));

router.get('/overview', adminController.overview);

router.post('/users', validate(createUserSchema), adminController.createUser);

router.get('/users', validate(listUsersQuerySchema, 'query'), adminController.listUsers);

router.patch(
  '/users/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  adminController.updateUser
);

router.delete(
  '/users/:id',
  validate(userIdParamSchema, 'params'),
  adminController.deactivateUser
);

module.exports = router;
