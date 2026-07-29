/**
 * 404 handler — ARCHITECTURE.md §17.1 (step 15).
 * Catches any request that matched no route and forwards a typed error
 * to the central error handler.
 */
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

export default notFound;
