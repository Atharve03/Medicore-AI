const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const prescriptionService = require('./prescription.service');

const create = asyncHandler(async (req, res) => {
  const result = await prescriptionService.createPrescription(req.user, req.body);
  return new ApiResponse(201, result, 'Prescription created successfully').send(res);
});

const getById = asyncHandler(async (req, res) => {
  const result = await prescriptionService.getById(req.params.id, req.user);
  return new ApiResponse(200, result).send(res);
});

const listByPatient = asyncHandler(async (req, res) => {
  const result = await prescriptionService.listByPatient(
    req.params.patientId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result).send(res);
});

module.exports = { create, getById, listByPatient };
