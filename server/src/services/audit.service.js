/**
 * Audit service — ARCHITECTURE.md §18.5, §2.8, §10.10.
 *
 * WRITE side is append-only: record() persists one AuditLog entry (and never
 * throws — an audit failure must not break the business operation that triggered
 * it). READ side (admin-only, exposed via /audit) offers list / get / entity
 * history / export. There is deliberately NO update or delete — an editable audit
 * trail is not an audit trail (§10.10).
 */
import { AuditLog } from '../models/AuditLog.model.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

/**
 * Record one audit entry. Fire-and-forget safe.
 * @param {object} entry  See fields below.
 * @returns {Promise<void>}
 */
export async function record(entry) {
  try {
    await AuditLog.create({
      actor: entry.actor ?? null,
      actorRole: entry.actorRole ?? null,
      actorName: entry.actorName ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      status: entry.status ?? 'success',
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    // Audit must never break the caller — log and move on.
    logger.error('Audit write failed', { action: entry.action, error: err.message });
  }
}

// --- Read side (admin) -----------------------------------------------------

function buildFilter(query = {}) {
  const filter = {};
  if (query.actor) filter.actor = query.actor;
  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  return filter;
}

export async function listAuditLogs(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter(query);
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getAuditLog(id) {
  const log = await AuditLog.findById(id).lean();
  if (!log) throw ApiError.notFound('Audit log not found', 'AUDIT_NOT_FOUND');
  return log;
}

export function entityHistory(entityType, entityId) {
  return AuditLog.find({ entityType, entityId }).sort({ createdAt: -1 }).lean();
}

/** Bounded fetch for CSV export (no pagination, capped). */
export function fetchForExport(query, cap = 5000) {
  return AuditLog.find(buildFilter(query)).sort({ createdAt: -1 }).limit(cap).lean();
}

export default { record, listAuditLogs, getAuditLog, entityHistory, fetchForExport };
