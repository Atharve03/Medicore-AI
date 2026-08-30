const env = require('../../config/env');
const LocalHashEmbedder = require('./localHashEmbedder');

let instance;

function getEmbeddingProvider() {
  if (instance) return instance;
  if (env.rag.embeddingProvider === 'local-hash') {
    instance = new LocalHashEmbedder({ dimensions: env.rag.embeddingDimensions });
    return instance;
  }
  throw new Error(`Unsupported RAG embedding provider: ${env.rag.embeddingProvider}`);
}

function _reset() { instance = undefined; }

module.exports = { getEmbeddingProvider, _reset };
