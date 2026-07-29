/**
 * Authorization middleware — ARCHITECTURE.md §17.2.2, §11.5.
 *
 * Three guards, all assume `authenticate` ran first (req.user present):
 *   - authorize(...roles)        → role-based gate (e.g. authorize('admin')).
 *   - requirePermission(...perms)→ permission-based gate via the RBAC map (§11.5).
 *   - authorizeOwnership(model,…)→ loads a document and allows the owner OR a
 *     holder of the bypass permission — the anti-IDOR guard. The model is passed
 *     in by the caller, so this file has no domain-model coupling.
 */
import { roleHasPermissions } from '../constants/permissions.js';
import { ApiError } from '../utils/ApiError.js';

/** Role-based: allow if the user's role is in the provided list. */
export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Not authenticated', 'NO_TOKEN'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient role', 'INSUFFICIENT_PERMISSIONS'));
    }
    return next();
  };
}

/** Permission-based: allow if the user's role holds every required permission. */
export function requirePermission(...permissions) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Not authenticated', 'NO_TOKEN'));
    if (!roleHasPermissions(req.user.role, permissions)) {
      return next(
        ApiError.forbidden(
          `Missing permission: ${permissions.join(', ')}`,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }
    return next();
  };
}

/**
 * Ownership guard (anti-IDOR).
 * @param {import('mongoose').Model} Model  Model to load the resource from
 * @param {object} [opts]
 * @param {string} [opts.param='id']         Route param holding the resource id
 * @param {string} [opts.ownerField='user']  Field on the doc holding the owner id
 * @param {string} [opts.bypassPermission]   Permission that bypasses ownership (e.g. admin '*')
 */
export function authorizeOwnership(Model, opts = {}) {
  const { param = 'id', ownerField = 'user', bypassPermission } = opts;
  return async (req, _res, next) => {
    try {
      if (!req.user) return next(ApiError.unauthorized('Not authenticated', 'NO_TOKEN'));

      const doc = await Model.findById(req.params[param]);
      if (!doc) return next(ApiError.notFound('Resource not found'));

      const ownerId = doc[ownerField];
      const isOwner = ownerId && ownerId.equals(req.user._id);
      const canBypass = bypassPermission
        ? roleHasPermissions(req.user.role, [bypassPermission])
        : roleHasPermissions(req.user.role, []); // admin '*' always passes

      if (!isOwner && !canBypass) {
        return next(ApiError.forbidden('You do not own this resource', 'NOT_OWNER'));
      }

      req.resource = doc; // avoid a second DB read in the controller
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export default { authorize, requirePermission, authorizeOwnership };
