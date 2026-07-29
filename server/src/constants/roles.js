/**
 * Role vocabulary — ARCHITECTURE.md §11.5 ("Role is data").
 *
 * This is DATA only (no authorization logic here). The permission policy that
 * maps roles -> permissions arrives in Phase 1 (constants/permissions.js).
 */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student',
  GUEST: 'guest',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

export default ROLES;
