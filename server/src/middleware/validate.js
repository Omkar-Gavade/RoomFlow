/**
 * Validation middleware — ARCHITECTURE.md §17.2.3, ADR-11.
 *
 * validate(schema, source):
 *   - Parses req[source] with a Zod schema.
 *   - On failure → 400 with structured { field, message } errors (§10.1 envelope).
 *   - On success → REPLACES req[source] with the parsed value, so unknown fields
 *     are stripped before business logic (mass-assignment defence, §23 #8).
 *
 * Actual per-module schemas arrive with their modules; this is the reusable wrapper.
 */
import { ApiError } from '../utils/ApiError.js';

/**
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.') || source,
        message: i.message,
      }));
      return next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', errors));
    }
    // Zod strips unknown keys when schemas use .strip()/.strict(); assign parsed value.
    req[source] = result.data;
    return next();
  };
}

export default validate;
