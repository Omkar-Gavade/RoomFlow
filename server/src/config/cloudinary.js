/**
 * Cloudinary SDK adapter — ARCHITECTURE.md ADR-13.
 *
 * Wraps the external SDK in one place so swapping to S3/other storage later
 * touches only this file + upload.service.js (Dependency Inversion, §3.3).
 * Images live on Cloudinary because Render's filesystem is ephemeral.
 */
import { v2 as cloudinary } from 'cloudinary';

import { env } from './env.js';
import { logger } from './logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** True when credentials are present; upload.service should guard on this. */
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
  logger.warn('⚠️  Cloudinary not configured — image uploads will be rejected until set.');
}

export { cloudinary };
export default cloudinary;
