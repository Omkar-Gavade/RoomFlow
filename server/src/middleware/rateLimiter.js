/**
 * Rate limiting — ARCHITECTURE.md §17.2.6, §23 (threat #4).
 *
 * Global limiter applied to all /api traffic. A factory is exported so per-route
 * limiters (authLimiter, bookingLimiter, …) can be built in later phases without
 * duplicating config. Placed BEFORE authentication so floods are cheap to reject.
 */
import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/** Shared JSON shape so a 429 matches the app error envelope (§22.3). */
function limitHandler(req, res) {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  });
}

/**
 * Build a limiter with sensible defaults.
 * @param {object} [opts] Overrides (windowMs, max, message)
 */
export function createRateLimiter(opts = {}) {
  return rateLimit({
    windowMs: opts.windowMs ?? env.RATE_LIMIT_WINDOW_MS,
    max: opts.max ?? env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limitHandler,
    ...opts,
  });
}

/** Global limiter for the whole API surface. */
export const globalLimiter = createRateLimiter();

/** Key by IP + email so one attacker cannot lock out a shared NAT IP entirely. */
function ipEmailKey(req) {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
  return `${req.ip}:${email}`;
}

/** Login/register brute-force guard — 5 per 15 min per IP+email (§23 #4). */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: ipEmailKey,
});

/** Forgot-password guard — 3 per 60 min per IP+email (§17.2.6). */
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: ipEmailKey,
});

export default globalLimiter;
