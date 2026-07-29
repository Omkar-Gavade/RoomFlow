/**
 * Auto-complete job — ARCHITECTURE.md §21.5 (FR-BOOK-14).
 * Approved bookings whose end time has passed transition to completed (system).
 */
import { Booking } from '../models/Booking.model.js';
import * as auditService from '../services/audit.service.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';

export async function autoCompleteJob() {
  const now = new Date();
  const due = await Booking.find({ status: BOOKING_STATUS.APPROVED, endsAt: { $lt: now } });

  for (const booking of due) {
    booking.status = BOOKING_STATUS.COMPLETED;
    booking.statusHistory.push({ status: BOOKING_STATUS.COMPLETED, changedAt: now, reason: 'Auto-completed' });
    // eslint-disable-next-line no-await-in-loop
    await booking.save();
    // eslint-disable-next-line no-await-in-loop
    await auditService.record({
      actor: null,
      actorRole: 'system',
      actorName: 'system',
      action: AUDIT_ACTIONS.BOOKING_COMPLETED,
      entityType: AUDIT_ENTITY_TYPES.BOOKING,
      entityId: booking._id,
      status: 'success',
      metadata: { job: 'auto-complete' },
    });
  }
  return { completed: due.length };
}

export default autoCompleteJob;
