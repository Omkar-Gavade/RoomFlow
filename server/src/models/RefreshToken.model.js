/**
 * RefreshToken model — ARCHITECTURE.md §11.1, §18.6, §7.3.
 *
 * Refresh tokens are OPAQUE random values; only their SHA-256 hash is stored, so
 * a database leak cannot be replayed. A separate collection (not embedded in User)
 * because token count is unbounded and needs a TTL index (§7.2).
 *
 * Rotation + reuse detection (§11.1):
 *   - On each refresh the old token is marked isRevoked and `replacedBy` points to
 *     its successor, forming a chain.
 *   - If a token that is already revoked is presented again → theft/replay → the
 *     whole chain for that user is revoked and a security event is logged.
 *
 * DATA LAYER ONLY — the rotation/reuse ALGORITHM lives in the auth service.
 */
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true }, // sha256 of the raw token
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    revokedReason: {
      type: String,
      enum: ['logout', 'logout_all', 'rotated', 'reuse_detected', 'password_changed', 'blocked', null],
      default: null,
    },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'RefreshToken', default: null },
    // Session metadata (§18.6).
    deviceInfo: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

// --- Indexes (§7.3) ---
// tokenHash unique index is created by `unique: true` above.
// TTL: Mongo removes the document once expiresAt passes (natural 7-day cleanup).
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
