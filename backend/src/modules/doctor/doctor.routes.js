const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  updateProfileSchema,
  listDoctorsQuerySchema,
  doctorIdParamSchema,
} = require('./doctor.validators');
const doctorController = require('./doctor.controller');

const router = express.Router();

router.use(authenticate);

// NOTE: '/me' must be registered before '/:id' or Express would match
// "me" as an :id value on the route below.
router.get('/me', authorize('doctor'), doctorController.getMyProfile);

router.patch(
  '/me',
  authorize('doctor'),
  validate(updateProfileSchema),
  doctorController.updateMyProfile
);

// Patients can browse/search doctors to pick one when booking (Phase 7).
router.get(
  '/',
  authorize('admin', 'receptionist', 'patient'),
  validate(listDoctorsQuerySchema, 'query'),
  doctorController.listDoctors
);

router.get(
  '/:id',
  authorize('admin', 'receptionist', 'patient'),
  validate(doctorIdParamSchema, 'params'),
  doctorController.getById
);

module.exports = router;
