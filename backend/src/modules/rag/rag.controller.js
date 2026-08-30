const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const ragService = require('../../rag/rag.service');

const ingest = asyncHandler(async (req, res) => {
  const result = await ragService.ingestDocument(req.body, req.user);
  return new ApiResponse(201, result, 'Knowledge document ingested').send(res);
});

const list = asyncHandler(async (req, res) => {
  const result = await ragService.listDocuments(req.query);
  return new ApiResponse(200, result).send(res);
});

const remove = asyncHandler(async (req, res) => {
  await ragService.deleteDocument(req.params.id);
  return new ApiResponse(200, null, 'Knowledge document deleted').send(res);
});

module.exports = { ingest, list, remove };
