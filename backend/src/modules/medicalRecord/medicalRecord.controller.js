const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { filesToAttachments } = require('../../middlewares/upload');
const medicalRecordService = require('./medicalRecord.service');

const UPLOAD_SUBFOLDER = 'medical-records';

const create = asyncHandler(async (req, res) => {
  const attachments = filesToAttachments(req.files, UPLOAD_SUBFOLDER);
  const result = await medicalRecordService.createRecord(req.user, req.body, attachments);
  return new ApiResponse(201, result, 'Medical record created successfully').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const result = await medicalRecordService.getById(req.params.id, req.user);
  return new ApiResponse(200, result).send(res);
});

const listByPatient = asyncHandler(async (req, res) => {
  const result = await medicalRecordService.listByPatient(
    req.params.patientId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result).send(res);
});

module.exports = { create, getById, listByPatient, UPLOAD_SUBFOLDER };
