const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createAdmissionSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  admissionIdParamSchema,
} = require('./admission.validators');
const admissionController = require('./admission.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('doctor', 'nurse'),
  validate(createAdmissionSchema),
  admissionController.create
);

router.patch(
  '/:id/discharge',
  authorize('doctor'),
  validate(admissionIdParamSchema, 'params'),
  admissionController.discharge
);

router.get(
  '/patient/:patientId',
  authorize('doctor', 'patient', 'nurse'),
  validate(patientIdParamSchema, 'params'),
  validate(listByPatientQuerySchema, 'query'),
  admissionController.listByPatient
);

module.exports = router;
