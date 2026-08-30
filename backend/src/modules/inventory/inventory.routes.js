const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createItemSchema,
  updateItemSchema,
  listItemsQuerySchema,
  itemIdParamSchema,
} = require('./inventory.validators');
const inventoryController = require('./inventory.controller');

const router = express.Router();

router.use(authenticate);

router.get(
  '/items',
  authorize('admin', 'nurse'),
  validate(listItemsQuerySchema, 'query'),
  inventoryController.listItems
);

router.post(
  '/items',
  authorize('admin', 'nurse'),
  validate(createItemSchema),
  inventoryController.createItem
);

router.patch(
  '/items/:id',
  authorize('admin'),
  validate(itemIdParamSchema, 'params'),
  validate(updateItemSchema),
  inventoryController.updateItem
);

module.exports = router;
