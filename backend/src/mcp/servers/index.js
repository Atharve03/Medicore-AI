const mcpRegistry = require('../registry/mcpRegistry');

const servers = [
  require('./patient.mcp'),
  require('./doctor.mcp'),
  require('./appointment.mcp'),
  require('./medicalRecord.mcp'),
  require('./laboratory.mcp'),
  require('./prescription.mcp'),
  require('./pharmacy.mcp'),
  require('./billing.mcp'),
  require('./inventory.mcp'),
  require('./admission.mcp'),
  require('./analytics.mcp'),
  require('./notification.mcp'),
];

function registerAll() {
  for (const server of servers) {
    mcpRegistry.registerServer(server);
  }
}

module.exports = { registerAll };
