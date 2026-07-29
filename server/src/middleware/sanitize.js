/**
 * Injection defence — ARCHITECTURE.md §17.1 (step 6), §23 (threats #3, #15).
 *
 * - express-mongo-sanitize: strips `$` and `.` from keys → blocks NoSQL operator
 *   injection (e.g. { "$gt": "" } as a password).
 * - hpp: HTTP Parameter Pollution guard (duplicate query keys).
 *
 * Applied BEFORE the logger so injected payloads are never written to logs.
 */
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/** Returns the ordered list of sanitisation middleware for app.js to spread. */
export function sanitizers() {
  return [
    mongoSanitize({ replaceWith: '_' }),
    hpp(),
  ];
}

export default sanitizers;
