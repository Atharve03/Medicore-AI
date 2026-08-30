const MCP_INTENTS = new Set([
  'appointment.upcoming',
  'laboratory.latest',
  'prescription.latest',
  'billing.summary',
  'medicalRecord.list',
  'patient.profile',
  'doctor.available',
  'notification.unread',
]);

function planRetrieval(message, intent) {
  const text = message.toLowerCase();
  const needsMcp = MCP_INTENTS.has(intent.name);
  const asksForExplanation = /\b(explain|meaning|what does|understand|interpret)\b/.test(text);
  const looksLikeKnowledgeQuestion = /\b(what is|what are|why|how|symptom|treatment|health|medical|disease|condition|diabetes|hypertension|nutrition|medicine|hydration)\b/.test(text);
  const needsRag =
    (intent.name === 'general' && looksLikeKnowledgeQuestion) ||
    (needsMcp && asksForExplanation && ['laboratory.latest', 'prescription.latest', 'medicalRecord.list'].includes(intent.name));

  return {
    needsMcp,
    needsRag,
    mode: needsMcp && needsRag ? 'both' : needsMcp ? 'mcp' : needsRag ? 'rag' : 'none',
  };
}

module.exports = { planRetrieval, MCP_INTENTS };
