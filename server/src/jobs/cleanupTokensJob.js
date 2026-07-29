/**
 * Cleanup-tokens job — ARCHITECTURE.md §21.5.
 * Removes revoked or expired refresh tokens (the TTL index also handles expiry;
 * this proactively purges revoked ones so the collection stays small).
 */
import { RefreshToken } from '../models/RefreshToken.model.js';

export async function cleanupTokensJob() {
  const now = new Date();
  const res = await RefreshToken.deleteMany({
    $or: [{ isRevoked: true }, { expiresAt: { $lt: now } }],
  });
  return { deleted: res.deletedCount || 0 };
}

export default cleanupTokensJob;
