const crypto = require('crypto');

class LocalHashEmbedder {
  constructor({ dimensions = 256 } = {}) {
    this.dimensions = dimensions;
    this.name = 'local-hash';
  }

  async embed(text) {
    const tokens = String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    const vector = new Array(this.dimensions).fill(0);
    const features = [...tokens];
    for (let i = 0; i < tokens.length - 1; i += 1) {
      features.push(`${tokens[i]}_${tokens[i + 1]}`);
    }
    for (const feature of features) {
      const digest = crypto.createHash('sha256').update(feature).digest();
      const index = digest.readUInt32BE(0) % this.dimensions;
      const sign = digest[4] % 2 === 0 ? 1 : -1;
      vector[index] += sign;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    return magnitude ? vector.map((value) => value / magnitude) : vector;
  }
}

module.exports = LocalHashEmbedder;
