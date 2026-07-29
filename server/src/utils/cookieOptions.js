/**
 * Refresh-token cookie options — ARCHITECTURE.md §11.1, §23 (#5 CSRF).
 *
 * httpOnly (unreadable by JS → XSS-resistant) + Secure (prod) + SameSite=Strict
 * (the CSRF strategy — no third-party site can send it). Scoped to the auth path
 * so it is only ever transmitted to /auth/refresh and /auth/logout.
 */
import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'refreshToken';

const COOKIE_PATH = `/api/${env.API_VERSION}/auth`;

/** Options for SETTING the refresh cookie (includes maxAge). */
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: COOKIE_PATH,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

/** Options for CLEARING the cookie — must match everything except maxAge. */
export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: COOKIE_PATH,
  };
}

export default { REFRESH_COOKIE_NAME, refreshCookieOptions, clearCookieOptions };
