const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const {
  createAppointmentSchema,
  updateStatusSchema,
  listMineQuerySchema,
  listAllQuerySchema,
  appointmentIdParamSchema,
} = require('./appointment.validators');
const appointmentController = require('./appointment.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('patient', 'receptionist'),
  validate(createAppointmentSchema),
  appointmentController.create
);

router.get(
  '/mine',
  authorize('patient', 'doctor'),
  validate(listMineQuerySchema, 'query'),
  appointmentController.listMine
);

router.get(
  '/',
  authorize('admin', 'receptionist'),
  validate(listAllQuerySchema, 'query'),
  appointmentController.listAll
);

router.patch(
  '/:id/status',
  authorize('doctor', 'receptionist'),
  validate(appointmentIdParamSchema, 'params'),
  validate(updateStatusSchema),
  appointmentController.updateStatus
);

router.delete(
  '/:id',
  authorize('patient', 'receptionist'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentController.cancel
);

module.exports = router;
