/**
 * iCalendar (.ics) generator — ARCHITECTURE.md §6 (FR-NOTIF-02).
 * Produces a minimal VEVENT so an approval email carries a calendar invite.
 * Pure function; times are UTC (§7.4).
 */

function toICSDate(date) {
  // YYYYMMDDTHHMMSSZ (UTC)
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(value = '') {
  return String(value).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}

/**
 * @param {object} p
 * @param {string} p.uid        Unique id (booking ref)
 * @param {Date|string} p.start
 * @param {Date|string} p.end
 * @param {string} p.summary
 * @param {string} [p.description]
 * @param {string} [p.location]
 * @returns {string} ICS document
 */
export function generateICS({ uid, start, end, summary, description = '', location = '' }) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RoomFlow//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@roomflow`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Wrap ICS content as a Nodemailer attachment. */
export function icsAttachment(ics, filename = 'booking.ics') {
  return { filename, content: ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' };
}

export default { generateICS, icsAttachment };
