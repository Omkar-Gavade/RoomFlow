/**
 * Pagination & query helpers — ARCHITECTURE.md §5.3, §19.4, §24.1.
 *
 * Reusable across every list endpoint (users now, rooms/bookings later) so the
 * response `meta` shape is identical everywhere — which is what lets the frontend
 * Pagination/Table components (DESIGN-SYSTEM §8.4) stay generic.
 */

/** Clamp page/limit and compute skip. limit capped at 100 (§5.3). */
export function getPagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
}

/** Standard pagination metadata returned in ApiResponse.meta. */
export function buildMeta(total, page, limit) {
  return { page, limit, total, totalPages: limit > 0 ? Math.ceil(total / limit) : 0 };
}

/** Escape user input before using it in a RegExp (ReDoS / injection safety). */
export function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" regex filter from safe user input. */
export function containsRegex(input) {
  return { $regex: escapeRegex(input), $options: 'i' };
}

/**
 * Parse a "-createdAt,name" sort string against a WHITELIST (§19.4 — sort
 * injection guard). Falls back to a default when nothing valid is provided.
 */
export function parseSort(sortStr, allowedFields = [], fallback = { createdAt: -1 }) {
  if (!sortStr) return fallback;
  const out = {};
  for (const raw of String(sortStr).split(',')) {
    const s = raw.trim();
    if (!s) continue;
    const desc = s.startsWith('-');
    const field = desc ? s.slice(1) : s;
    if (allowedFields.includes(field)) out[field] = desc ? -1 : 1;
  }
  return Object.keys(out).length ? out : fallback;
}

export default { getPagination, buildMeta, escapeRegex, containsRegex, parseSort };
