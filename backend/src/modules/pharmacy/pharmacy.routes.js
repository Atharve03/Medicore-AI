const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createMedicineSchema,
  updateMedicineSchema,
  listMedicinesQuerySchema,
  medicineIdParamSchema,
  dispenseSchema,
  listOrdersQuerySchema,
} = require('./pharmacy.validators');
const pharmacyController = require('./pharmacy.controller');

const router = express.Router();

router.use(authenticate);

router.get(
  '/medicines',
  authorize('pharmacist', 'admin'),
  validate(listMedicinesQuerySchema, 'query'),
  pharmacyController.listMedicines
);

router.post(
  '/medicines',
  authorize('pharmacist', 'admin'),
  validate(createMedicineSchema),
  pharmacyController.createMedicine
);

// Not in the original API design list, but a natural extension of
// "POST /pharmacy/medicines" — restocking and price corrections need a way
// in, and pharmacist/admin are the same roles that create the catalog entry.
router.patch(
  '/medicines/:id',
  authorize('pharmacist', 'admin'),
  validate(medicineIdParamSchema, 'params'),
  validate(updateMedicineSchema),
  pharmacyController.updateMedicine
);

router.post(
  '/dispense',
  authorize('pharmacist'),
  validate(dispenseSchema),
  pharmacyController.dispense
);

router.get(
  '/orders',
  authorize('pharmacist', 'admin'),
  validate(listOrdersQuerySchema, 'query'),
  pharmacyController.listOrders
);

module.exports = router;
