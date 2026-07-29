/**
 * Upload service (FOUNDATION) — ARCHITECTURE.md §17.2.7, ADR-13.
 *
 * Streams an in-memory buffer to Cloudinary and returns only { url, publicId }
 * for persistence. Verifies the real image signature (magic bytes) rather than
 * trusting the client Content-Type. Domain rules (max 5 images, primary image)
 * live in room.service.js later — this service only owns the transfer.
 */
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/** Magic-byte signatures for the allowed image types. */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'png';
  // WEBP: "RIFF"...."WEBP"
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp';
  return null;
}

/**
 * Upload a single image buffer.
 * @param {Buffer} buffer
 * @param {object} [opts]
 * @param {string} [opts.folder]
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export function uploadImage(buffer, opts = {}) {
  if (!isCloudinaryConfigured) {
    return Promise.reject(ApiError.internal('Cloudinary not configured', 'UPLOAD_UNAVAILABLE'));
  }
  if (!detectImageType(buffer)) {
    return Promise.reject(ApiError.badRequest('File is not a valid image', 'INVALID_FILE_SIGNATURE'));
  }

  const folder = opts.folder || env.CLOUDINARY_FOLDER;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(ApiError.internal('Image upload failed', 'UPLOAD_FAILED'));
        return resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an asset by its Cloudinary public id.
 * @param {string} publicId
 */
export async function deleteImage(publicId) {
  if (!isCloudinaryConfigured || !publicId) return { result: 'skipped' };
  return cloudinary.uploader.destroy(publicId);
}

export default { uploadImage, deleteImage };
