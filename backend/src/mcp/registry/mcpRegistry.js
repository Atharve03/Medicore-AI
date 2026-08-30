/**
 * A lightweight in-process MCP-style registry. Each "MCP server" is a
 * domain-scoped module (Patient, Laboratory, Billing, ...) that registers
 * a small set of named tools here. A tool is a plain async function of
 * (args, context) -> data, where `context.requestingUser` is always
 * required and drives the tool's own access check — the same shape every
 * route handler already uses, just called from the AI path instead of
 * HTTP.
 *
 * This registry itself enforces nothing about *what* a tool returns; each
 * server is responsible for keeping its own tools narrow (see
 * mcp/servers/_shared/authz.js for the shared patient-ownership check
 * reused across servers). What the registry *does* enforce: a tool can
 * only be invoked by exact server+tool name, so nothing can be queried
 * that wasn't explicitly exposed.
 */

const servers = new Map();

function registerServer({ name, description, tools }) {
  if (servers.has(name)) {
    throw new Error(`MCP server '${name}' is already registered`);
  }
  if (!tools || typeof tools !== 'object' || Object.keys(tools).length === 0) {
    throw new Error(`MCP server '${name}' must register at least one tool`);
  }
  for (const [toolName, tool] of Object.entries(tools)) {
    if (typeof tool.handler !== 'function') {
      throw new Error(`Tool '${name}.${toolName}' is missing a handler function`);
    }
  }
  servers.set(name, { name, description, tools });
}

function getServer(name) {
  return servers.get(name) || null;
}

function listServers() {
  return [...servers.values()].map((s) => ({
    name: s.name,
    description: s.description,
    tools: Object.entries(s.tools).map(([toolName, tool]) => ({
      name: toolName,
      description: tool.description,
    })),
  }));
}

/**
 * Invokes serverName.toolName(args, context). Throws a plain Error with a
 * clear message on an unknown server/tool rather than silently returning
 * undefined — a typo'd tool name should fail loudly during development,
 * not surface as an empty AI response.
 */
async function callTool(serverName, toolName, args, context) {
  const server = servers.get(serverName);
  if (!server) {
    throw new Error(`Unknown MCP server: '${serverName}'`);
  }
  const tool = server.tools[toolName];
  if (!tool) {
    throw new Error(`Unknown tool '${toolName}' on MCP server '${serverName}'`);
  }
  if (!context || !context.requestingUser) {
    throw new Error(`MCP tool calls require a requestingUser in context`);
  }
  return tool.handler(args || {}, context);
}

/** Test-only: clears all registrations so suites don't leak state. */
function _reset() {
  servers.clear();
}

module.exports = { registerServer, getServer, listServers, callTool, _reset };
