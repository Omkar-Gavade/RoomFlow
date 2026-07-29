/**
 * Expire-pending job — ARCHITECTURE.md §21.5 (FR-BOOK-15).
 * Pending bookings not actioned before their start time transition to expired,
 * freeing the slot. Requester gets an in-app notice.
 */
import { Booking } from '../models/Booking.model.js';
import * as auditService from '../services/audit.service.js';
import * as notification from '../services/notification.service.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';

export async function expirePendingJob() {
  const now = new Date();
  const due = await Booking.find({ status: BOOKING_STATUS.PENDING, startsAt: { $lt: now } });

  for (const booking of due) {
    booking.status = BOOKING_STATUS.EXPIRED;
    booking.statusHistory.push({ status: BOOKING_STATUS.EXPIRED, changedAt: now, reason: 'Not actioned in time' });
    // eslint-disable-next-line no-await-in-loop
    await booking.save();
    // eslint-disable-next-line no-await-in-loop
    await auditService.record({
      actor: null,
      actorRole: 'system',
      actorName: 'system',
      action: AUDIT_ACTIONS.BOOKING_EXPIRED,
      entityType: AUDIT_ENTITY_TYPES.BOOKING,
      entityId: booking._id,
      status: 'success',
      metadata: { job: 'expire-pending' },
    });
    // eslint-disable-next-line no-await-in-loop
    await notification
      .createNotification({
        recipientId: booking.user,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Booking expired',
        message: `Booking ${booking.bookingRef} expired — it was not approved before its start time.`,
        relatedBooking: booking._id,
        link: `/bookings/${booking._id}`,
      })
      .catch(() => {});
  }
  return { expired: due.length };
}

export default expirePendingJob;
