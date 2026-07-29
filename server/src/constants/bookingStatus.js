/**
 * Booking status vocabulary — ARCHITECTURE.md §21.1, DESIGN-SYSTEM.md §2.2.
 *
 * DATA only — the state machine (legal transitions) is business logic and lives
 * in the service layer (Phase 3), not here. `expired` is included per §21.1.
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
});

export const BOOKING_STATUS_VALUES = Object.freeze(Object.values(BOOKING_STATUS));

/** Statuses that occupy a slot (used later by conflict detection index/queries). */
export const ACTIVE_BOOKING_STATUSES = Object.freeze([
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.APPROVED,
]);

/** Recurrence types (§18.3). */
export const RECURRENCE_TYPES = Object.freeze({
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
});

export const RECURRENCE_VALUES = Object.freeze(Object.values(RECURRENCE_TYPES));

export default BOOKING_STATUS;
