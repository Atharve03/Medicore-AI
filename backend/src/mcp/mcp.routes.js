const express = require('express');

const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const mcpClient = require('./client/mcpClient');

const router = express.Router();

router.get(
  '/tools',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const servers = mcpClient.listAvailableTools();
    return new ApiResponse(200, { servers }).send(res);
  })
);

module.exports = router;
