/**
 * ApiError — typed operational error. ARCHITECTURE.md §15.3, §17.2.4, §22.3.
 *
 * Distinguishes EXPECTED failures (conflict, not found, forbidden) that carry a
 * user-facing message and a stable machine code, from programmer errors (bugs)
 * which the error handler reports generically. `code` matches the §22.3 vocabulary.
 */
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ApiError extends Error {
  /**
   * @param {number} statusCode  HTTP status
   * @param {string} message     Human-readable message
   * @param {string} [code]      Stable machine code (§22.3), e.g. 'BOOKING_CONFLICT'
   * @param {Array<{field:string,message:string}>} [errors]  Field-level details
   */
  constructor(statusCode, message, code = 'ERROR', errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true; // expected, safe to surface to the client
    Error.captureStackTrace(this, this.constructor);
  }

  // --- Convenience factories (kept minimal for Phase 0) ---
  static badRequest(message = 'Bad request', code = 'VALIDATION_ERROR', errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, code, errors);
  }

  static unauthorized(message = 'Unauthenticated', code = 'UNAUTHENTICATED') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, code);
  }

  static forbidden(message = 'Forbidden', code = 'INSUFFICIENT_PERMISSIONS') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message, code);
  }

  static notFound(message = 'Resource not found', code = 'RESOURCE_NOT_FOUND') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message, code);
  }

  static conflict(message = 'Conflict', code = 'CONFLICT', errors = []) {
    return new ApiError(HTTP_STATUS.CONFLICT, message, code, errors);
  }

  static unprocessable(message = 'Unprocessable', code = 'BUSINESS_RULE_VIOLATION', errors = []) {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, code, errors);
  }

  static tooMany(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, code);
  }
}

export default ApiError;
