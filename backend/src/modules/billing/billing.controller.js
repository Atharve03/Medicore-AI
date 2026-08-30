const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const billingService = require('./billing.service');

const createInvoice = asyncHandler(async (req, res) => {
  const result = await billingService.createInvoice(req.body);
  return new ApiResponse(201, result, 'Invoice created successfully').send(res);
});

const listByPatient = asyncHandler(async (req, res) => {
  const result = await billingService.listByPatient(
    req.params.patientId,
    req.user,
    req.query
  );
  return new ApiResponse(200, result).send(res);
});

const payInvoice = asyncHandler(async (req, res) => {
  const result = await billingService.payInvoice(req.params.id, req.body.amount);
  return new ApiResponse(200, result, 'Payment recorded successfully').send(res);
});

module.exports = { createInvoice, listByPatient, payInvoice };
