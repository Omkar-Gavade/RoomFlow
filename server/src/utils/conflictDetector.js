/**
 * Conflict detector — ARCHITECTURE.md §20 (the functional core).
 *
 * PURE overlap logic + Mongo filter builders. No I/O here (SOLID: the DB call
 * lives in the service, which owns the session/transaction). This makes the
 * overlap rule unit-testable in milliseconds without Express or a database.
 *
 * Intervals are HALF-OPEN [start, end): a booking ending at 10:00 and one
 * starting at 10:00 do NOT conflict (§20.1) — back-to-back bookings are allowed.
 */
import { ACTIVE_BOOKING_STATUSES } from '../constants/bookingStatus.js';

/**
 * The single overlap condition covering positional cases 2–5 (§20.1):
 *   A.start < B.end  AND  A.end > B.start
 */
export function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/** Filter for bookings on the same ROOM overlapping [startsAt, endsAt). */
export function roomOverlapFilter(roomId, startsAt, endsAt, excludeId = null) {
  const filter = {
    room: roomId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return filter;
}

/** Filter for bookings by the same USER overlapping the window (any room). */
export function userOverlapFilter(userId, startsAt, endsAt, excludeId = null) {
  const filter = {
    user: userId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return filter;
}

export default { intervalsOverlap, roomOverlapFilter, userOverlapFilter };
