/**
 * CORS policy — ARCHITECTURE.md §23 (threat #14: Unrestricted CORS).
 *
 * Strict origin allowlist from env, credentials enabled (refresh-token cookie),
 * explicit methods and headers. No wildcard origin in any environment.
 */
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

export const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin / server-to-server / health checks (no Origin header).
    if (!origin) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(ApiError.forbidden(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400,
};

export default corsOptions;
