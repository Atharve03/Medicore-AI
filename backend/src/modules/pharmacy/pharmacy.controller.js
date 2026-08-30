const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const pharmacyService = require('./pharmacy.service');

const createMedicine = asyncHandler(async (req, res) => {
  const result = await pharmacyService.createMedicine(req.body);
  return new ApiResponse(201, result, 'Medicine added to catalog').send(res);
});

const updateMedicine = asyncHandler(async (req, res) => {
  const result = await pharmacyService.updateMedicine(req.params.id, req.body);
  return new ApiResponse(200, result, 'Medicine updated successfully').send(res);
});

const listMedicines = asyncHandler(async (req, res) => {
  const result = await pharmacyService.listMedicines(req.query);
  return new ApiResponse(200, result).send(res);
});

const dispense = asyncHandler(async (req, res) => {
  const result = await pharmacyService.dispense(req.user, req.body);
  return new ApiResponse(201, result, 'Prescription dispensed successfully').send(res);
});

const listOrders = asyncHandler(async (req, res) => {
  const result = await pharmacyService.listOrders(req.query);
  return new ApiResponse(200, result).send(res);
});

module.exports = {
  createMedicine,
  updateMedicine,
  listMedicines,
  dispense,
  listOrders,
};
