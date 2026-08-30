const ApiError = require('../../utils/ApiError');
const mcpClient = require('../../mcp/client/mcpClient');
const { getProvider } = require('../gateway/providerManager');
const systemPrompt = require('../prompts/systemPrompt');
const conversationStore = require('./conversationStore');
const { detectIntent } = require('./intentRouter');
const { planRetrieval } = require('./retrievalPlanner');
const ragService = require('../../rag/rag.service');

async function ownPatientId(requestingUser) {
  if (requestingUser.role !== 'patient') {
    throw ApiError.badRequest('Specify a patient through an approved clinical workflow');
  }
  const profile = await mcpClient.call('patient', 'getOwnProfile', {}, { requestingUser });
  return profile?.id;
}

async function retrieve(intent, requestingUser) {
  const context = { requestingUser };
  switch (intent.name) {
    case 'forbidden.cross_patient': throw ApiError.forbidden("The AI assistant cannot access another patient's data");
    case 'appointment.upcoming': return mcpClient.call('appointment', 'getUpcomingForPatient', { patientId: await ownPatientId(requestingUser), limit: 5 }, context);
    case 'laboratory.latest': return mcpClient.call('laboratory', 'getLatestReportForPatient', { patientId: await ownPatientId(requestingUser) }, context);
    case 'prescription.latest': return mcpClient.call('prescription', 'getLatestForPatient', { patientId: await ownPatientId(requestingUser) }, context);
    case 'billing.summary': return mcpClient.call('billing', 'getSummaryForPatient', { patientId: await ownPatientId(requestingUser), limit: 5 }, context);
    case 'medicalRecord.list': return mcpClient.call('medicalRecord', 'listForPatient', { patientId: await ownPatientId(requestingUser), limit: 5 }, context);
    case 'patient.profile': return mcpClient.call('patient', 'getOwnProfile', {}, context);
    case 'doctor.available': return mcpClient.call('doctor', 'listAvailable', { limit: 10 }, context);
    case 'notification.unread': return mcpClient.call('notification', 'listUnreadForCaller', { limit: 10 }, context);
    case 'analytics.insight': return mcpClient.call('analytics', 'getAuthorizedAnalytics', { section: intent.section, range: intent.range }, context);
    default: return undefined;
  }
}

function minimize(value) {
  if (value === undefined) return undefined;
  // MCP tools can return Mongoose arrays/subdocuments. Their prototype
  // accessors are not safe to recursively enumerate and may contain cycles.
  // JSON serialization invokes Mongoose's supported toJSON conversion first.
  const plain = JSON.parse(JSON.stringify(value));
  const visit = (current) => {
    if (Array.isArray(current)) return current.map(visit);
    if (!current || typeof current !== 'object') return current;
    return Object.fromEntries(
      Object.entries(current)
        .filter(([key]) => !/(^id$|Id$|password|otp|token|secret)/i.test(key))
        .map(([key, nested]) => [key, visit(nested)])
    );
  };
  return visit(plain);
}

async function chat({ message, requestingUser }) {
  const intent = detectIntent(message);
  if (intent.name === 'forbidden.cross_patient') {
    await retrieve(intent, requestingUser);
  }
  const plan = planRetrieval(message, intent);
  const [applicationData, knowledgeResults] = await Promise.all([
    plan.needsMcp ? retrieve(intent, requestingUser) : undefined,
    plan.needsRag ? ragService.retrieve(message) : [],
  ]);
  const data = minimize(applicationData);
  const knowledgeContext = ragService.buildContext(knowledgeResults);
  const previous = conversationStore.get(requestingUser.id);
  const messages = [...previous, { role: 'user', content: message }];
  const result = await getProvider().generate({
    systemPrompt,
    messages,
    context: {
      retrievalMode: plan.mode,
      ...(data === undefined ? {} : { authorizedApplicationData: { intent: intent.name, data } }),
      ...(knowledgeContext ? { untrustedKnowledgeExcerpts: knowledgeContext } : {}),
    },
  });
  conversationStore.append(
    requestingUser.id,
    { role: 'user', content: message },
    { role: 'assistant', content: result.text }
  );
  return {
    reply: result.text,
    provider: result.provider,
    model: result.model,
    usage: result.usage || { promptTokens: null, completionTokens: null },
    intent: intent.name,
    retrievalMode: plan.mode,
    toolUsed: plan.needsMcp ? intent.name : null,
    sources: knowledgeResults.map(({ documentId, title, source, chunkIndex, score }) => ({
      documentId,
      title,
      source,
      chunkIndex,
      score,
    })),
  };
}

module.exports = { chat, clearConversation: conversationStore.clear, minimize };
