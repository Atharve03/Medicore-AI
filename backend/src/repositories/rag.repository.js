const { KnowledgeDocument } = require('../models/knowledgeDocument.model');
const { KnowledgeChunk } = require('../models/knowledgeChunk.model');

const ragRepository = {
  createDocument(data) {
    return KnowledgeDocument.create(data);
  },

  createChunks(chunks) {
    return KnowledgeChunk.insertMany(chunks);
  },

  updateChunkCount(documentId, chunkCount) {
    return KnowledgeDocument.findByIdAndUpdate(documentId, { chunkCount }, { new: true });
  },

  async listDocuments({ page = 1, limit = 20 } = {}) {
    const filter = { accessScope: 'general' };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      KnowledgeDocument.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      KnowledgeDocument.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  listSearchCandidates(limit) {
    return KnowledgeChunk.find({ accessScope: 'general' })
      .select('+embedding')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
  },

  async deleteDocument(documentId) {
    const document = await KnowledgeDocument.findOneAndDelete({
      _id: documentId,
      accessScope: 'general',
    });
    if (document) await KnowledgeChunk.deleteMany({ documentId });
    return document;
  },

  async cleanupFailedIngestion(documentId) {
    await Promise.all([
      KnowledgeDocument.findByIdAndDelete(documentId),
      KnowledgeChunk.deleteMany({ documentId }),
    ]);
  },
};

module.exports = ragRepository;
