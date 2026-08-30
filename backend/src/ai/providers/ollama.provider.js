const ApiError = require('../../utils/ApiError');

class OllamaProvider {
  constructor({ baseUrl, model }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.name = 'local';
  }

  async generate({ systemPrompt, messages, context }) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            ...(context
              ? [{ role: 'system', content: `Authorized application data:\n${JSON.stringify(context)}` }]
              : []),
          ],
          options: { temperature: 0.2 },
        }),
      });
    } catch {
      throw new ApiError(503, 'Local AI is unavailable. Confirm Ollama is running and try again.');
    }

    if (!response.ok) {
      throw new ApiError(503, `Local AI request failed with status ${response.status}`);
    }
    const data = await response.json();
    const text = data?.message?.content?.trim();
    if (!text) throw new ApiError(502, 'Local AI returned an empty response');
    return {
      text,
      provider: this.name,
      model: this.model,
      usage: { promptTokens: data.prompt_eval_count || null, completionTokens: data.eval_count || null },
    };
  }
}

module.exports = OllamaProvider;
