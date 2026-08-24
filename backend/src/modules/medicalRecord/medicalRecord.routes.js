const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { createUploader, wrapUpload } = require('../../middlewares/upload');
const {
  createMedicalRecordSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  recordIdParamSchema,
} = require('./medicalRecord.validators');
const medicalRecordController = require('./medicalRecord.controller');

const router = express.Router();
const uploader = createUploader(medicalRecordController.UPLOAD_SUBFOLDER);

router.use(authenticate);

router.post(
  '/',
  authorize('doctor'),
  wrapUpload(uploader.array('attachments', 5)),
  validate(createMedicalRecordSchema),
  medicalRecordController.create
);

router.get(
  '/patient/:patientId',
  authorize('doctor', 'patient', 'admin'),
  validate(patientIdParamSchema, 'params'),
  validate(listByPatientQuerySchema, 'query'),
  medicalRecordController.listByPatient
);

router.get(
  '/:id',
  authorize('doctor', 'patient'),
  validate(recordIdParamSchema, 'params'),
  medicalRecordController.getById
);

module.exports = router;
