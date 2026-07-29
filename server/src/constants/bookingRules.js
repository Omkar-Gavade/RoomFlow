/**
 * Booking rule constants — ARCHITECTURE.md §19.3, §1.3 (FR-BOOK-06/15).
 *
 * SystemConfig (§18.6) is deferred; until then these are the authoritative
 * defaults. Config values, NOT schema. When SystemConfig lands these move behind
 * its cached accessor without touching booking logic.
 */
export const BOOKING_RULES = Object.freeze({
  MIN_DURATION_MIN: 15,
  MAX_DURATION_MIN: 240, // 4 hours
  MAX_ADVANCE_DAYS: 60,
  MAX_ACTIVE_BOOKINGS: 5, // pending + approved, in the future
});

export default BOOKING_RULES;
