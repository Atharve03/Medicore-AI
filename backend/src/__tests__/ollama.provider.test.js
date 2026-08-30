const OllamaProvider = require('../ai/providers/ollama.provider');

function jsonResponse(data, { ok = true, status = 200 } = {}) {
  return { ok, status, json: jest.fn().mockResolvedValue(data) };
}

describe('Ollama provider', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it('verifies the configured model and returns a successful Qwen response', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ models: [{ name: 'qwen-test' }] }))
      .mockResolvedValueOnce(jsonResponse({
        message: { content: 'Ready' }, prompt_eval_count: 3, eval_count: 1,
      }));
    const provider = new OllamaProvider({
      baseUrl: 'http://ollama.test:11434/', model: 'qwen-test', timeoutMs: 1000,
    });

    const result = await provider.generate({ systemPrompt: 'safe', messages: [], context: null });

    expect(global.fetch.mock.calls[0][0]).toBe('http://ollama.test:11434/api/tags');
    expect(global.fetch.mock.calls[1][0]).toBe('http://ollama.test:11434/api/chat');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body).model).toBe('qwen-test');
    expect(result).toMatchObject({ text: 'Ready', provider: 'local', model: 'qwen-test' });
  });

  it('turns an unavailable Ollama server into a controlled 503', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused'));
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'qwen-test' });
    await expect(provider.generate({ systemPrompt: 'safe', messages: [] }))
      .rejects.toMatchObject({ statusCode: 503 });
  });

  it('returns a controlled error when the configured model is not installed', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({
      models: [{ name: 'another-model:latest' }],
    }));
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'qwen-test' });

    await expect(provider.generate({ systemPrompt: 'safe', messages: [] }))
      .rejects.toMatchObject({ statusCode: 503, message: expect.stringContaining('qwen-test') });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('maps chat model-not-found without exposing Ollama response details', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ models: [{ name: 'qwen-test' }] }))
      .mockResolvedValueOnce(jsonResponse(
        { error: 'internal ollama details' }, { ok: false, status: 404 }
      ));
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'qwen-test' });

    await expect(provider.generate({ systemPrompt: 'safe', messages: [] }))
      .rejects.toMatchObject({
        statusCode: 503,
        message: expect.not.stringContaining('internal ollama details'),
      });
  });

  it('aborts timed-out requests and returns a controlled 504', async () => {
    global.fetch = jest.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        const error = new Error('aborted');
        error.name = 'AbortError';
        reject(error);
      });
    }));
    const provider = new OllamaProvider({
      baseUrl: 'http://localhost:11434', model: 'qwen-test', timeoutMs: 5,
    });

    await expect(provider.generate({ systemPrompt: 'safe', messages: [] }))
      .rejects.toMatchObject({ statusCode: 504 });
  });

  it('rejects invalid JSON cleanly', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ models: [{ name: 'qwen-test' }] }))
      .mockResolvedValueOnce({
        ok: true, status: 200, json: jest.fn().mockRejectedValue(new SyntaxError()),
      });
    const provider = new OllamaProvider({ baseUrl: 'http://localhost:11434', model: 'qwen-test' });

    await expect(provider.generate({ systemPrompt: 'safe', messages: [] }))
      .rejects.toMatchObject({ statusCode: 502 });
  });
});
