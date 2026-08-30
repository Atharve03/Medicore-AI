const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const orchestrator = require('../../ai/orchestrator/aiOrchestrator');
const aiUsage = require('../../services/aiUsage.service');

const chat = asyncHandler(async (req, res) => {
  const started = Date.now();
  try {
    const result = await orchestrator.chat({ message: req.body.message, requestingUser: req.user });
    await aiUsage.record({ user: req.user, result, durationMs: Date.now() - started, success: true });
    return new ApiResponse(200, result, 'AI response generated').send(res);
  } catch (error) {
    await aiUsage.record({ user: req.user, result: null, durationMs: Date.now() - started, success: false });
    throw error;
  }
});

const clear = asyncHandler(async (req, res) => {
  orchestrator.clearConversation(req.user.id);
  return new ApiResponse(200, null, 'Conversation cleared').send(res);
});

module.exports = { chat, clear };
