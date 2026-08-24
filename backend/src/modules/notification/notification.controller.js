const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notification.service');

const listMine = asyncHandler(async (req, res) => {
  const result = await notificationService.listMine(req.user.id, req.query);
  return new ApiResponse(200, result).send(res);
});

const markRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markRead(req.params.id, req.user);
  return new ApiResponse(200, result, 'Notification marked as read').send(res);
});

module.exports = { listMine, markRead };
