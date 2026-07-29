/**
 * Crypto helpers — ARCHITECTURE.md §11.1, §23.2.
 * Opaque token generation + one-way hashing for refresh/reset/verify tokens.
 */
import crypto from 'node:crypto';

/** Cryptographically-random hex token (default 64 bytes → 128 hex chars). */
export function generateRawToken(bytes = 64) {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Deterministic SHA-256 hash — store this, never the raw token. */
export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export default { generateRawToken, hashToken };
