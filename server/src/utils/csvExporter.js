/**
 * CSV exporter — ARCHITECTURE.md §10.6 (FR-REP-05).
 * Pure serialisation with RFC-4180 quoting. No I/O.
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * @param {object[]} rows
 * @param {Array<{key:string,label?:string}>} [columns]  Defaults to keys of row[0].
 * @returns {string} CSV text
 */
export function toCSV(rows, columns) {
  const cols = columns || (rows[0] ? Object.keys(rows[0]).map((k) => ({ key: k })) : []);
  const header = cols.map((c) => escapeCell(c.label || c.key)).join(',');
  const body = rows.map((r) => cols.map((c) => escapeCell(r[c.key])).join(','));
  return [header, ...body].join('\r\n');
}

export default { toCSV };
