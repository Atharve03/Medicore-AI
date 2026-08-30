const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    source: { type: String, required: true, trim: true, maxlength: 500 },
    accessScope: { type: String, enum: ['general'], default: 'general', required: true },
    chunkIndex: { type: Number, required: true, min: 0 },
    text: { type: String, required: true, maxlength: 4000 },
    embedding: { type: [Number], required: true, select: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
module.exports = { KnowledgeChunk };
