const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/**
 * Builds an Express upload middleware storing files under
 * `<uploads dir>/<subfolder>/`, restricted to common image/PDF types and
 * env-configured max size. The returned middleware exposes `.array(field)`
 * / `.single(field)` like a normal Multer instance.
 */
function createUploader(subfolder) {
  const destination = path.resolve(process.cwd(), env.uploads.dir, subfolder);
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
    }
    return cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: env.uploads.maxSizeMb * 1024 * 1024 },
  });
}

/**
 * Converts the files Multer attached to req.files into the
 * `{ url, type }[]` shape stored on documents (e.g. MedicalRecord).
 */
function filesToAttachments(files, subfolder) {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    url: `/uploads/${subfolder}/${file.filename}`,
    type: file.mimetype,
  }));
}

/**
 * Wraps a Multer middleware (e.g. uploader.array('attachments', 5)) so that
 * MulterError (file too large, too many files, etc.) is converted into the
 * same normalized 400 ApiError shape the rest of the API uses, instead of
 * falling through to errorHandler as an unstyled 500.
 */
function wrapUpload(multerMiddleware) {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return next(ApiError.badRequest(`Upload error: ${err.message}`));
      }
      return next(err);
    });
  };
}

module.exports = { createUploader, filesToAttachments, wrapUpload };
