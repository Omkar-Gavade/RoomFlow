/**
 * Central error handler — ARCHITECTURE.md §17.2.4.
 *
 * MUST be registered LAST (Express identifies it by arity = 4 args).
 * Maps every error type to the §22.3 code vocabulary and the §10.1 envelope.
 * Operational errors surface precise messages; programmer errors return a
 * generic 500 while the full stack goes to the logs (no info disclosure, §23 #12).
 */
import { ZodError } from 'zod';

import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/** Translate known error shapes into a normalised { statusCode, code, message, errors }. */
function normalize(err) {
  // Our own typed operational errors.
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, code: err.code, message: err.message, errors: err.errors };
  }

  // Zod (defensive — validate middleware usually wraps these already).
  if (err instanceof ZodError) {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    };
  }

  // Mongoose validation.
  if (err.name === 'ValidationError') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message })),
    };
  }

  // Mongoose bad ObjectId.
  if (err.name === 'CastError') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: 'INVALID_ID',
      message: `Invalid ${err.path}`,
      errors: [],
    };
  }

  // Mongo duplicate key.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || { field: '' })[0];
    return {
      statusCode: HTTP_STATUS.CONFLICT,
      code: 'DUPLICATE_ENTRY',
      message: `Duplicate value for '${field}'`,
      errors: [{ field, message: 'Already exists' }],
    };
  }

  // JWT (Phase 1).
  if (err.name === 'JsonWebTokenError') {
    return { statusCode: HTTP_STATUS.UNAUTHORIZED, code: 'INVALID_TOKEN', message: 'Invalid token', errors: [] };
  }
  if (err.name === 'TokenExpiredError') {
    return { statusCode: HTTP_STATUS.UNAUTHORIZED, code: 'TOKEN_EXPIRED', message: 'Token expired', errors: [] };
  }

  // Multer upload errors.
  if (err.name === 'MulterError') {
    const map = { LIMIT_FILE_SIZE: 'FILE_TOO_LARGE', LIMIT_FILE_COUNT: 'TOO_MANY_FILES' };
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: map[err.code] || 'UPLOAD_ERROR',
      message: err.message,
      errors: [],
    };
  }

  // Unknown → programmer error.
  return {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
    errors: [],
  };
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, req, res, _next) {
  const { statusCode, code, message, errors } = normalize(err);

  // Log: operational errors at warn, unexpected at error with full stack.
  const meta = { requestId: req.id, method: req.method, url: req.originalUrl, code };
  if (statusCode >= 500) {
    logger.error(message, { ...meta, stack: err.stack });
  } else {
    logger.warn(message, meta);
  }

  const body = { success: false, message, code };
  if (errors && errors.length) body.errors = errors;
  // Expose stack only outside production (§23 #12).
  if (!env.isProduction && statusCode >= 500) body.stack = err.stack;
  body.requestId = req.id;

  res.status(statusCode).json(body);
}

export default errorHandler;
