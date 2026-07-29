/**
 * AuditLog model — ARCHITECTURE.md §18.5, §2.8, §7.3.
 *
 * APPEND-ONLY by design: only createdAt (no updatedAt), and pre-hooks on any
 * update/delete operation THROW. "An audit trail that can be edited is not an
 * audit trail." Actor role/name are snapshotted so the entry stays readable even
 * if the user is later deleted. before/after store CHANGED FIELDS ONLY (secrets
 * redacted by the writing service). No read/update/delete API exists (§10.10).
 */
import mongoose from 'mongoose';

import { AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';

import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // null = system action
    actorRole: { type: String, default: null },
    actorName: { type: String, default: null }, // snapshot — survives user deletion
    action: { type: String, required: [true, 'Audit action is required'], trim: true },
    entityType: {
      type: String,
      enum: { values: Object.values(AUDIT_ENTITY_TYPES), message: 'Invalid entity type: {VALUE}' },
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, default: null },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    metadata: { type: Schema.Types.Mixed, default: null }, // e.g. { requestId }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.plugin(toJSONPlugin);

// --- Indexes (§7.3) ---
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 }); // entity history
auditLogSchema.index({ actor: 1, createdAt: -1 }); // "what did this user do?"

// --- Immutability guard (§18.5) ---
function blockMutation(next) {
  next(new Error('AuditLog is append-only and cannot be modified or deleted'));
}
for (const hook of ['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete', 'replaceOne']) {
  auditLogSchema.pre(hook, blockMutation);
}
auditLogSchema.pre('save', function preventResave(next) {
  if (!this.isNew) return next(new Error('AuditLog entries are immutable'));
  return next();
});

export const AuditLog = model('AuditLog', auditLogSchema);
export default AuditLog;
