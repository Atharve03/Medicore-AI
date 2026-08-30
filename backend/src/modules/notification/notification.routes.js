const express = require('express');

const validate = require('../../utils/validate');
const authenticate = require('../../middlewares/authenticate');
const {
  listMineQuerySchema,
  notificationIdParamSchema,
} = require('./notification.validators');
const notificationController = require('./notification.controller');

const router = express.Router();

router.use(authenticate);

router.get(
  '/mine',
  validate(listMineQuerySchema, 'query'),
  notificationController.listMine
);

router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  notificationController.markRead
);

module.exports = router;
