const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../utils/validate');
const { chatSchema } = require('./ai.validators');
const controller = require('./ai.controller');

const router = express.Router();
router.use(authenticate, authorize('patient', 'doctor', 'admin', 'receptionist', 'nurse', 'pharmacist', 'labTechnician'));
router.post('/chat', validate(chatSchema), controller.chat);
router.delete('/conversation', controller.clear);

module.exports = router;
