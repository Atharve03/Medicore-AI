const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const admissionService = require('./admission.service');

const create = asyncHandler(async (req, res) => {
  const result = await admissionService.createAdmission(req.user, req.body);
  return new ApiResponse(201, result, 'Patient admitted successfully').send(res);
});

const discharge = asyncHandler(async (req, res) => {
  const result = await admissionService.dischargeAdmission(req.params.id);
  return new ApiResponse(200, result, 'Patient discharged successfully').send(res);
});

const listByPatient = asyncHandler(async (req, res) => {
  const result = await admissionService.listByPatient(
    req.params.patientId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result).send(res);
});

module.exports = { create, discharge, listByPatient };
