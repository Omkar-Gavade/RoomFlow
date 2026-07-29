/**
 * Booking time helpers — ARCHITECTURE.md §7.4 (all times UTC).
 * Deterministic UTC construction so availability/conflict math never depends on
 * server timezone. Pure functions.
 */

/** Combine a date (any Date-ish) + "HH:mm" into an absolute UTC Date. */
export function toUtcDateTime(dateInput, hhmm) {
  const d = new Date(dateInput);
  const [h, m] = String(hhmm).split(':').map(Number);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m, 0, 0));
}

/** Midnight UTC for the given date (matches Booking.bookingDate normalisation). */
export function utcDayStart(dateInput) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/** Day of week in UTC (0 = Sunday … 6 = Saturday). */
export function utcDayOfWeek(dateInput) {
  return new Date(dateInput).getUTCDay();
}

/** "HH:mm" for a UTC Date. */
export function toHHMM(date) {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function minutesBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

export default { toUtcDateTime, utcDayStart, utcDayOfWeek, toHHMM, addMinutes, minutesBetween };
