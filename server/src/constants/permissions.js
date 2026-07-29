/**
 * Permission-based RBAC policy — ARCHITECTURE.md §11.5 (verbatim mapping).
 *
 * The SINGLE source of authorization policy. Routes declare the permission they
 * require; adding a role is one entry here, not an edit across route files
 * (Open/Closed, ADR-05). `'*'` is a wildcard granting everything.
 *
 * NOTE: ownership (`:own`) still requires a runtime owner check in the service /
 * ownership middleware — a permission alone never authorises reading another
 * user's record (anti-IDOR, §11.5).
 */
import { ROLES } from './roles.js';

export const PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: ['*'],
  [ROLES.STAFF]: [
    'room:read',
    'booking:create',
    'booking:read:all',
    'booking:approve',
    'booking:reject',
    'booking:cancel:own',
    'report:read',
    'dashboard:staff',
    'profile:update',
  ],
  [ROLES.STUDENT]: [
    'room:read',
    'booking:create',
    'booking:read:own',
    'booking:cancel:own',
    'dashboard:student',
    'profile:update',
  ],
  [ROLES.GUEST]: ['room:read', 'booking:create:limited', 'booking:read:own'],
});

/** Resolve the permission list for a role (empty array if unknown). */
export function permissionsForRole(role) {
  return PERMISSIONS[role] || [];
}

/** True if a role holds every required permission (or the wildcard). */
export function roleHasPermissions(role, required = []) {
  const granted = permissionsForRole(role);
  if (granted.includes('*')) return true;
  return required.every((p) => granted.includes(p));
}

export default PERMISSIONS;
