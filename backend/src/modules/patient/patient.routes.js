const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  updateProfileSchema,
  listPatientsQuerySchema,
  patientIdParamSchema,
} = require('./patient.validators');
const patientController = require('./patient.controller');

const router = express.Router();

router.use(authenticate);

// NOTE: '/me' must be registered before '/:id' or Express would match
// "me" as an :id value on the route below.
router.get('/me', authorize('patient'), patientController.getMyProfile);

router.patch(
  '/me',
  authorize('patient'),
  validate(updateProfileSchema),
  patientController.updateMyProfile
);

router.get(
  '/',
  authorize('admin', 'receptionist'),
  validate(listPatientsQuerySchema, 'query'),
  patientController.listPatients
);

router.get(
  '/:id',
  authorize('admin', 'doctor', 'receptionist'),
  validate(patientIdParamSchema, 'params'),
  patientController.getById
);

module.exports = router;
