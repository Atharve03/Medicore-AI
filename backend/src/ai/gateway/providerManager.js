const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const OllamaProvider = require('../providers/ollama.provider');

let instance;

function getProvider() {
  if (instance) return instance;
  if (env.ai.provider === 'local') {
    instance = new OllamaProvider(env.ai.ollama);
    return instance;
  }
  if (!['openai', 'claude', 'gemini'].includes(env.ai.provider)) {
    throw ApiError.internal(`Unsupported AI provider '${env.ai.provider}'`);
  }
  const config = env.ai[env.ai.provider];
  if (!config?.apiKey) {
    throw new ApiError(503, `The selected AI provider '${env.ai.provider}' is not configured`);
  }
  throw new ApiError(501, `Provider '${env.ai.provider}' is configured but its adapter is not implemented yet`);
}

function _reset() { instance = undefined; }

module.exports = { getProvider, _reset };
