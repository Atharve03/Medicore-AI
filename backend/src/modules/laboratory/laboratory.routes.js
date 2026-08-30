const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const parseJsonFields = require('../../middlewares/parseJsonFields');
const { createUploader, wrapUpload } = require('../../middlewares/upload');
const {
  createOrderSchema,
  submitResultsSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  orderIdParamSchema,
} = require('./laboratory.validators');
const laboratoryController = require('./laboratory.controller');

const router = express.Router();
const uploader = createUploader(laboratoryController.UPLOAD_SUBFOLDER);

router.use(authenticate);

router.post(
  '/orders',
  authorize('doctor'),
  validate(createOrderSchema),
  laboratoryController.createOrder
);

router.patch(
  '/orders/:id/results',
  authorize('labTechnician'),
  wrapUpload(uploader.single('reportFile')),
  validate(orderIdParamSchema, 'params'),
  parseJsonFields('results'),
  validate(submitResultsSchema),
  laboratoryController.submitResults
);

router.get(
  '/reports/patient/:patientId',
  authorize('doctor', 'patient', 'labTechnician'),
  validate(patientIdParamSchema, 'params'),
  validate(listByPatientQuerySchema, 'query'),
  laboratoryController.listByPatient
);

module.exports = router;
