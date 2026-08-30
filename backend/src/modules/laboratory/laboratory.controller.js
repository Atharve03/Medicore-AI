const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const laboratoryService = require('./laboratory.service');

const UPLOAD_SUBFOLDER = 'lab-reports';

const createOrder = asyncHandler(async (req, res) => {
  const result = await laboratoryService.createOrder(req.user, req.body);
  return new ApiResponse(201, result, 'Lab order created successfully').send(res);
});

const submitResults = asyncHandler(async (req, res) => {
  const reportFileUrl = req.file
    ? `/uploads/${UPLOAD_SUBFOLDER}/${req.file.filename}`
    : null;
  const result = await laboratoryService.submitResults(
    req.params.id,
    req.body,
    reportFileUrl
  );
  return new ApiResponse(200, result, 'Results submitted successfully').send(res);
});

const listByPatient = asyncHandler(async (req, res) => {
  const result = await laboratoryService.listByPatient(
    req.params.patientId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result).send(res);
});

module.exports = { createOrder, submitResults, listByPatient, UPLOAD_SUBFOLDER };
