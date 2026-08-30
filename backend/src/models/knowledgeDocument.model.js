const mongoose = require('mongoose');

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    source: { type: String, required: true, trim: true, maxlength: 500 },
    mimeType: { type: String, required: true, trim: true, maxlength: 100 },
    accessScope: { type: String, enum: ['general'], default: 'general', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    characterCount: { type: Number, required: true, min: 1 },
    chunkCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

knowledgeDocumentSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id,
    title: this.title,
    source: this.source,
    mimeType: this.mimeType,
    accessScope: this.accessScope,
    metadata: this.metadata,
    characterCount: this.characterCount,
    chunkCount: this.chunkCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
module.exports = { KnowledgeDocument };
