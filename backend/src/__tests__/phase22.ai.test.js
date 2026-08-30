jest.mock('../mcp/client/mcpClient');
jest.mock('../ai/gateway/providerManager');
jest.mock('../rag/rag.service');

const mcpClient = require('../mcp/client/mcpClient');
const { getProvider } = require('../ai/gateway/providerManager');
const orchestrator = require('../ai/orchestrator/aiOrchestrator');
const { detectIntent } = require('../ai/orchestrator/intentRouter');
const request = require('supertest');
const app = require('../app');
const { User } = require('../models/user.model');
const { signAccessToken } = require('../utils/jwt');
const ragService = require('../rag/rag.service');
const { LabReport } = require('../models/labReport.model');

describe('Phase 22 AI integration', () => {
  const requestingUser = { id: 'user-1', role: 'patient' };

  beforeEach(() => {
    jest.resetAllMocks();
    orchestrator.clearConversation(requestingUser.id);
    getProvider.mockReturnValue({
      generate: jest.fn().mockResolvedValue({ text: 'Your next appointment is available.', provider: 'local', model: 'qwen-test' }),
    });
    ragService.retrieve.mockResolvedValue([]);
    ragService.buildContext.mockImplementation((results) =>
      results.map((item) => item.chunk).join('\n')
    );
  });

  afterEach(() => jest.restoreAllMocks());

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
    expect(ragService.retrieve).toHaveBeenCalled();
  });

  it('rejects cross-patient requests before MCP access', async () => {
    await expect(orchestrator.chat({ message: "Show another patient's records", requestingUser })).rejects.toThrow(/cannot access/i);
    expect(mcpClient.call).not.toHaveBeenCalled();
  });

  it('detects healthcare application intents deterministically', () => {
    expect(detectIntent('show my latest blood report').name).toBe('laboratory.latest');
    expect(detectIntent('which doctors are available?').name).toBe('doctor.available');
  });

  it('returns RAG citations for a general healthcare question', async () => {
    ragService.retrieve.mockResolvedValue([{
      documentId: 'doc-1', title: 'Diabetes guide', source: 'Hospital handbook',
      chunk: 'Diabetes is a chronic condition.', chunkIndex: 0, score: 0.91,
    }]);

    const result = await orchestrator.chat({
      message: 'What is diabetes?', requestingUser,
    });

    expect(result.retrievalMode).toBe('rag');
    expect(result.sources).toEqual([expect.objectContaining({ title: 'Diabetes guide' })]);
    expect(mcpClient.call).not.toHaveBeenCalled();
  });

  it('combines authorized MCP data with general RAG context when explaining a lab report', async () => {
    mcpClient.call
      .mockResolvedValueOnce({ id: 'patient-1' })
      .mockResolvedValueOnce({ id: 'report-1', testType: 'CBC' });
    ragService.retrieve.mockResolvedValue([{
      documentId: 'doc-1', title: 'CBC guide', source: 'Hospital handbook',
      chunk: 'CBC reference information.', chunkIndex: 0, score: 0.88,
    }]);

    const result = await orchestrator.chat({
      message: 'Explain my latest lab report', requestingUser,
    });

    expect(result.retrievalMode).toBe('both');
    expect(mcpClient.call).toHaveBeenCalledWith(
      'laboratory', 'getLatestReportForPatient', expect.anything(), expect.anything()
    );
    expect(ragService.retrieve).toHaveBeenCalled();
  });

  it('safely minimizes Mongoose document arrays without recursion overflow', () => {
    const report = new LabReport({
      patientId: '507f1f77bcf86cd799439011',
      doctorId: '507f1f77bcf86cd799439012',
      testType: 'CBC',
      status: 'completed',
      results: [{ parameter: 'Hemoglobin', value: '14', unit: 'g/dL' }],
    });

    const minimized = orchestrator.minimize(report.toClientJSON());
    expect(minimized.results).toEqual([
      expect.objectContaining({ parameter: 'Hemoglobin', value: '14' }),
    ]);
    expect(minimized.patientId).toBeUndefined();
    expect(minimized.doctorId).toBeUndefined();
  });

  it('requires backend authentication for the chat API', async () => {
    const response = await request(app).post('/api/v1/ai/chat').send({ message: 'Hello' });
    expect(response.status).toBe(401);
  });

  it('accepts authenticated chat and derives identity from the access token', async () => {
    const token = signAccessToken({ _id: '507f1f77bcf86cd799439011', role: 'patient' });
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011', role: 'patient', isActive: true,
      }),
    });

    const response = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'What does hydration mean?', userId: 'attacker', role: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ provider: 'local', intent: 'general' });
    expect(getProvider).toHaveBeenCalled();
  });
});
