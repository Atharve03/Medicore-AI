jest.mock('../mcp/client/mcpClient');
jest.mock('../ai/gateway/providerManager');

const mcpClient = require('../mcp/client/mcpClient');
const { getProvider } = require('../ai/gateway/providerManager');
const orchestrator = require('../ai/orchestrator/aiOrchestrator');
const { detectIntent } = require('../ai/orchestrator/intentRouter');
const request = require('supertest');
const app = require('../app');

describe('Phase 22 AI integration', () => {
  const requestingUser = { id: 'user-1', role: 'patient' };

  beforeEach(() => {
    jest.resetAllMocks();
    orchestrator.clearConversation(requestingUser.id);
    getProvider.mockReturnValue({
      generate: jest.fn().mockResolvedValue({ text: 'Your next appointment is available.', provider: 'local', model: 'qwen-test' }),
    });
  });

  it('routes current appointment data through MCP and removes identifiers', async () => {
    mcpClient.call
      .mockResolvedValueOnce({ id: 'patient-secret-id' })
      .mockResolvedValueOnce([{ id: 'appointment-secret-id', status: 'confirmed' }]);

    const result = await orchestrator.chat({ message: 'What is my next appointment?', requestingUser });
    expect(mcpClient.call).toHaveBeenCalledWith('appointment', 'getUpcomingForPatient', expect.anything(), expect.anything());
    const providerInput = getProvider.mock.results[0].value.generate.mock.calls[0][0];
    expect(JSON.stringify(providerInput.context)).not.toContain('secret-id');
    expect(result.provider).toBe('local');
  });

  it('does not call MCP for general information', async () => {
    await orchestrator.chat({ message: 'What does hydration mean?', requestingUser });
    expect(mcpClient.call).not.toHaveBeenCalled();
  });

  it('rejects cross-patient requests before MCP access', async () => {
    await expect(orchestrator.chat({ message: "Show another patient's records", requestingUser })).rejects.toThrow(/cannot access/i);
    expect(mcpClient.call).not.toHaveBeenCalled();
  });

  it('detects healthcare application intents deterministically', () => {
    expect(detectIntent('show my latest blood report').name).toBe('laboratory.latest');
    expect(detectIntent('which doctors are available?').name).toBe('doctor.available');
  });

  it('requires backend authentication for the chat API', async () => {
    const response = await request(app).post('/api/v1/ai/chat').send({ message: 'Hello' });
    expect(response.status).toBe(401);
  });
});
