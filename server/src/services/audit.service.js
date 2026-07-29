/**
 * Audit service (FOUNDATION) — ARCHITECTURE.md §18.5, §2.8, §21.4.
 *
 * The audit trail is append-only. This foundation exposes the WRITE interface
 * that every state-changing service will call. In Phase 0 there is no AuditLog
 * model yet, so entries are written to the structured logger; when the model
 * lands (Phase 1) only the body of `record()` changes — callers stay identical
 * (Dependency Inversion, §3.3). No read/update/delete interface exists by design.
 */
import { logger } from '../config/logger.js';

/**
 * Record one audit entry.
 * @param {object} entry
 * @param {string|null} entry.actor        User id, or null for system actions
 * @param {string} [entry.actorRole]
 * @param {string} entry.action            AUDIT_ACTIONS value
 * @param {string} entry.entityType        AUDIT_ENTITY_TYPES value
 * @param {string} [entry.entityId]
 * @param {object} [entry.before]          Changed fields only (secrets redacted)
 * @param {object} [entry.after]
 * @param {string} [entry.ipAddress]
 * @param {string} [entry.userAgent]
 * @param {'success'|'failure'} [entry.status='success']
 * @param {object} [entry.metadata]        e.g. { requestId }
 * @returns {Promise<void>}
 */
export async function record(entry) {
  const auditEntry = {
    actor: entry.actor ?? null,
    actorRole: entry.actorRole,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    before: entry.before,
    after: entry.after,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    status: entry.status ?? 'success',
    metadata: entry.metadata,
    createdAt: new Date().toISOString(),
  };

  // Phase 0: structured log. Phase 1: await AuditLog.create(auditEntry).
  logger.info('AUDIT', { audit: auditEntry });
}

export default { record };
