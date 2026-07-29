/**
 * Reminder job — ARCHITECTURE.md §21.5 (FR-NOTIF-05).
 * Emails/notifies for approved bookings starting within the lead window.
 * Idempotent via the `reminderSent` flag.
 */
import { Booking } from '../models/Booking.model.js';
import * as notification from '../services/notification.service.js';
import { env } from '../config/env.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export async function reminderJob() {
  const now = new Date();
  const until = new Date(now.getTime() + env.REMINDER_LEAD_MINUTES * 60000);

  const due = await Booking.find({
    status: BOOKING_STATUS.APPROVED,
    reminderSent: false,
    startsAt: { $gt: now, $lte: until },
  }).lean();

  for (const booking of due) {
    // eslint-disable-next-line no-await-in-loop
    await notification.notifyBookingReminder(booking).catch(() => {});
    // eslint-disable-next-line no-await-in-loop
    await Booking.updateOne({ _id: booking._id }, { $set: { reminderSent: true } });
  }
  return { reminded: due.length };
}

export default reminderJob;
