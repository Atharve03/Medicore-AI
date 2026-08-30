const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const orchestrator = require('../../ai/orchestrator/aiOrchestrator');

const chat = asyncHandler(async (req, res) => {
  const result = await orchestrator.chat({ message: req.body.message, requestingUser: req.user });
  return new ApiResponse(200, result, 'AI response generated').send(res);
});

const clear = asyncHandler(async (req, res) => {
  orchestrator.clearConversation(req.user.id);
  return new ApiResponse(200, null, 'Conversation cleared').send(res);
});

module.exports = { chat, clear };
