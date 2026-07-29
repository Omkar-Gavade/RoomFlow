/**
 * Token service — ARCHITECTURE.md §11.1, §11.3.
 *
 * Owns the token mechanics so the auth service orchestrates without touching JWT
 * or the RefreshToken collection directly (SRP):
 *   - Access token: short-lived JWT (15 min), carries { sub, role, name }.
 *   - Refresh token: opaque random value; only its SHA-256 hash is persisted.
 *   - Rotation: revoke the old refresh record, create a new one, link the chain.
 *   - Reuse detection helpers for the auth service.
 */
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { generateRawToken, hashToken } from '../utils/crypto.js';

/** Sign a short-lived access token. */
export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
}

/** Verify an access token; throws JsonWebTokenError/TokenExpiredError on failure. */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Create and persist a new refresh token record.
 * @returns {Promise<{ raw: string, doc: import('mongoose').Document }>}
 */
export async function createRefreshToken(user, meta = {}) {
  const raw = generateRawToken(64);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  const doc = await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(raw),
    expiresAt,
    deviceInfo: meta.deviceInfo || null,
    ipAddress: meta.ipAddress || null,
    userAgent: meta.userAgent || null,
  });
  return { raw, doc };
}

/** Look up a refresh record by the raw token value. */
export function findRefreshByRaw(raw) {
  return RefreshToken.findOne({ tokenHash: hashToken(raw) });
}

/** Revoke a single refresh record. */
export async function revokeRefreshToken(doc, reason, replacedById = null) {
  doc.isRevoked = true;
  doc.revokedReason = reason;
  if (replacedById) doc.replacedBy = replacedById;
  await doc.save();
}

/** Revoke every active refresh record for a user (logout-all / password change). */
export function revokeAllUserTokens(userId, reason) {
  return RefreshToken.updateMany(
    { user: userId, isRevoked: false },
    { $set: { isRevoked: true, revokedReason: reason } }
  );
}

/**
 * Rotate: create a successor, then revoke the old record and link the chain.
 * @returns {Promise<{ raw: string, doc: import('mongoose').Document }>}
 */
export async function rotateRefreshToken(oldDoc, user, meta = {}) {
  const next = await createRefreshToken(user, meta);
  await revokeRefreshToken(oldDoc, 'rotated', next.doc._id);
  return next;
}

export default {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  findRefreshByRaw,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
};
