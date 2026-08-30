const OllamaProvider = require('../ai/providers/ollama.provider');

describe('Ollama provider', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('uses its configured base URL and model', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Ready' }, prompt_eval_count: 3, eval_count: 1 }),
    });
    const provider = new OllamaProvider({ baseUrl: 'http://ollama.test:11434/', model: 'qwen-test' });
    const result = await provider.generate({ systemPrompt: 'safe', messages: [], context: null });
    expect(global.fetch).toHaveBeenCalledWith('http://ollama.test:11434/api/chat', expect.anything());
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).model).toBe('qwen-test');
    expect(result.provider).toBe('local');
  });

  it('turns an unavailable Ollama server into a controlled 503', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'qwen-test' });
    await expect(provider.generate({ systemPrompt: 'safe', messages: [] })).rejects.toMatchObject({ statusCode: 503 });
  });
});
