const logger = require('../../config/logger');
const mcpRegistry = require('../registry/mcpRegistry');

/**
 * The AI Orchestrator (Phase 22) is the only intended caller of this
 * module. It never imports Mongoose models or repositories directly —
 * every piece of data it retrieves comes through here, one narrow tool
 * call at a time.
 */
async function call(serverName, toolName, args, context) {
  const startedAt = Date.now();
  try {
    const result = await mcpRegistry.callTool(serverName, toolName, args, context);
    logger.info(
      `MCP ${serverName}.${toolName} ok (${Date.now() - startedAt}ms) user=${context?.requestingUser?.id}`
    );
    return result;
  } catch (err) {
    logger.error(`MCP ${serverName}.${toolName} failed: ${err.message}`);
    throw err;
  }
}

function listAvailableTools() {
  return mcpRegistry.listServers();
}

module.exports = { call, listAvailableTools };
