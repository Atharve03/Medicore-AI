const ApiError = require('../../utils/ApiError');
const mcpClient = require('../../mcp/client/mcpClient');
const { getProvider } = require('../gateway/providerManager');
const systemPrompt = require('../prompts/systemPrompt');
const conversationStore = require('./conversationStore');
const { detectIntent } = require('./intentRouter');

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
    default: return undefined;
  }
}

function minimize(value) {
  if (Array.isArray(value)) return value.map(minimize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/(^id$|Id$|password|otp|token|secret)/i.test(key))
      .map(([key, nested]) => [key, minimize(nested)])
  );
}

async function chat({ message, requestingUser }) {
  const intent = detectIntent(message);
  const data = minimize(await retrieve(intent, requestingUser));
  const previous = conversationStore.get(requestingUser.id);
  const messages = [...previous, { role: 'user', content: message }];
  const result = await getProvider().generate({
    systemPrompt,
    messages,
    context: data === undefined ? undefined : { intent: intent.name, data },
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
    intent: intent.name,
    toolUsed: intent.name === 'general' ? null : intent.name,
  };
}

module.exports = { chat, clearConversation: conversationStore.clear };
