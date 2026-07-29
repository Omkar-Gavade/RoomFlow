/**
 * File upload middleware — ARCHITECTURE.md §17.2.7.
 *
 * Multer MEMORY storage (Render's filesystem is ephemeral — never write to disk).
 * Limits: 5 MB/file, 5 files/request. MIME allowlist checked here; deep buffer
 * signature verification happens in upload.service.js before Cloudinary streaming.
 */
import multer from 'multer';

import { ApiError } from '../utils/ApiError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
  return cb(ApiError.badRequest('Only JPEG, PNG, or WebP images are allowed', 'INVALID_FILE_TYPE'));
}

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter,
});

/** Single file upload (e.g. avatar). */
export const uploadSingle = (field) => multerInstance.single(field);

/** Multiple files (e.g. room images, max 5). */
export const uploadArray = (field, max = MAX_FILES) => multerInstance.array(field, max);

export { MAX_FILE_SIZE, MAX_FILES, ALLOWED_MIME };
export default multerInstance;
