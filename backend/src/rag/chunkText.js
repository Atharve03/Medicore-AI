function chunkText(text, { chunkSize = 1000, overlap = 150 } = {}) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (!normalized) return [];
  if (chunkSize < 100 || overlap < 0 || overlap >= chunkSize) {
    throw new Error('Invalid chunk size or overlap configuration');
  }

  const chunks = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const boundary = Math.max(
        normalized.lastIndexOf('\n', end),
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf(' ', end)
      );
      if (boundary > start + Math.floor(chunkSize * 0.6)) end = boundary + 1;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

module.exports = { chunkText };
