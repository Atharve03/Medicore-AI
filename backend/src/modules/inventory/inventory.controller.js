const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const inventoryService = require('./inventory.service');

const createItem = asyncHandler(async (req, res) => {
  const result = await inventoryService.createItem(req.body);
  return new ApiResponse(201, result, 'Inventory item created successfully').send(res);
});

const updateItem = asyncHandler(async (req, res) => {
  const result = await inventoryService.updateItem(req.params.id, req.body);
  return new ApiResponse(200, result, 'Inventory item updated successfully').send(res);
});

const listItems = asyncHandler(async (req, res) => {
  const result = await inventoryService.listItems(req.query);
  return new ApiResponse(200, result).send(res);
});

module.exports = { createItem, updateItem, listItems };
