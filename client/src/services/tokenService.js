/**
 * Access-token store — ARCHITECTURE.md §11.1, ADR-03.
 * The access token lives in MEMORY only (never localStorage) — XSS-resistant.
 * The refresh token is an httpOnly cookie the JS never touches.
 */
let accessToken = null;

export const tokenService = {
  get: () => accessToken,
  set: (token) => {
    accessToken = token || null;
  },
  clear: () => {
    accessToken = null;
  },
};

export default tokenService;
