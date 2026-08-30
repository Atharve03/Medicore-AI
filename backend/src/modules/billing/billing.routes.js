const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createInvoiceSchema,
  payInvoiceSchema,
  listByPatientQuerySchema,
  patientIdParamSchema,
  invoiceIdParamSchema,
} = require('./billing.validators');
const billingController = require('./billing.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/invoices',
  authorize('receptionist', 'admin'),
  validate(createInvoiceSchema),
  billingController.createInvoice
);

router.get(
  '/invoices/patient/:patientId',
  authorize('patient', 'receptionist', 'admin'),
  validate(patientIdParamSchema, 'params'),
  validate(listByPatientQuerySchema, 'query'),
  billingController.listByPatient
);

router.patch(
  '/invoices/:id/pay',
  authorize('receptionist'),
  validate(invoiceIdParamSchema, 'params'),
  validate(payInvoiceSchema),
  billingController.payInvoice
);

module.exports = router;
