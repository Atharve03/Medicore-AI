const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createPrescriptionSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  prescriptionIdParamSchema,
} = require('./prescription.validators');
const prescriptionController = require('./prescription.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('doctor'),
  validate(createPrescriptionSchema),
  prescriptionController.create
);

router.get(
  '/patient/:patientId',
  authorize('doctor', 'patient', 'pharmacist'),
  validate(patientIdParamSchema, 'params'),
  validate(listByPatientQuerySchema, 'query'),
  prescriptionController.listByPatient
);

router.get(
  '/:id',
  authorize('doctor', 'patient', 'pharmacist'),
  validate(prescriptionIdParamSchema, 'params'),
  prescriptionController.getById
);

module.exports = router;
