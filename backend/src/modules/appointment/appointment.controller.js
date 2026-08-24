const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const appointmentService = require('./appointment.service');

const create = asyncHandler(async (req, res) => {
  const result = await appointmentService.createAppointment(req.body, req.user);
  return new ApiResponse(201, result, 'Appointment requested successfully').send(res);
});

const listMine = asyncHandler(async (req, res) => {
  const result = await appointmentService.listMine(req.user, req.query);
  return new ApiResponse(200, result).send(res);
});

const listAll = asyncHandler(async (req, res) => {
  const result = await appointmentService.listAll(req.query);
  return new ApiResponse(200, result).send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const result = await appointmentService.updateStatus(req.params.id, req.body.status);
  return new ApiResponse(200, result, 'Appointment status updated').send(res);
});

const cancel = asyncHandler(async (req, res) => {
  const result = await appointmentService.cancelAppointment(req.params.id);
  return new ApiResponse(200, result, 'Appointment cancelled').send(res);
});

module.exports = { create, listMine, listAll, updateStatus, cancel };
