const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../utils/validate');
const controller = require('./rag.controller');
const {
  ingestDocumentSchema,
  listDocumentsSchema,
  documentIdSchema,
} = require('./rag.validators');

const router = express.Router();
router.use(authenticate, authorize('admin'));
router.post('/documents', validate(ingestDocumentSchema), controller.ingest);
router.get('/documents', validate(listDocumentsSchema, 'query'), controller.list);
router.delete('/documents/:id', validate(documentIdSchema, 'params'), controller.remove);

module.exports = router;
