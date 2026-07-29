/**
 * Authentication middleware — ARCHITECTURE.md §17.2.1, §11.3.
 *
 * Verifies the Bearer access token, then RE-FETCHES the user from the DB (a JWT
 * is a snapshot; re-loading gives immediate revocation on block/role change/
 * password change — §11.3). Attaches req.user (Mongoose doc, no password) and
 * req.auth ({ id, role }).
 *
 * Distinct error codes let the client know when to silently refresh (§5.2).
 */
import { verifyAccessToken } from '../services/token.service.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

function extractBearer(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

export async function authenticate(req, _res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return next(ApiError.unauthorized('No token provided', 'NO_TOKEN'));

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
      return next(ApiError.unauthorized(err.message, code));
    }

    const user = await User.findById(payload.sub).select('-password');
    if (!user || user.isDeleted) {
      return next(ApiError.unauthorized('User no longer exists', 'USER_NOT_FOUND'));
    }
    if (user.isBlocked) {
      return next(ApiError.forbidden('Account is blocked', 'ACCOUNT_BLOCKED'));
    }
    if (user.passwordChangedAfter(payload.iat)) {
      return next(ApiError.unauthorized('Password changed, please log in again', 'PASSWORD_CHANGED'));
    }

    req.user = user;
    req.auth = { id: user._id.toString(), role: user.role, iat: payload.iat };
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Optional variant — attaches req.user when a valid token is present, else continues. */
export async function optionalAuth(req, _res, next) {
  const token = extractBearer(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password');
    if (user && !user.isDeleted && !user.isBlocked) {
      req.user = user;
      req.auth = { id: user._id.toString(), role: user.role, iat: payload.iat };
    }
  } catch {
    // Ignore — this endpoint is public, personalisation is best-effort.
  }
  return next();
}

export default authenticate;
