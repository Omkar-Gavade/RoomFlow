/**
 * Booking service — ARCHITECTURE.md §16, §19.3, §20, §21, §10.4.
 *
 * The functional core of RoomFlow. Business logic + audit. Conflict detection is
 * atomic (transaction + retry, §20.4); state changes go through the state machine
 * (§21). Notifications/email are deferred to Phase 4 — marked with hooks. Reuses
 * conflictDetector, bookingStateMachine, availability service, pagination, audit.
 */
import { Booking } from '../models/Booking.model.js';
import { Room } from '../models/Room.model.js';
import * as auditService from './audit.service.js';
import * as availability from './availability.service.js';
import * as notification from './notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { runWithOptionalTransaction } from '../utils/withTransaction.js';
import { roomOverlapFilter, userOverlapFilter } from '../utils/conflictDetector.js';
import { assertTransition } from '../utils/bookingStateMachine.js';
import { getPagination, buildMeta, parseSort } from '../utils/pagination.js';
import { utcDayOfWeek, utcDayStart } from '../utils/bookingTime.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';
import { BOOKING_STATUS, ACTIVE_BOOKING_STATUSES } from '../constants/bookingStatus.js';
import { ROOM_STATUS } from '../constants/roomCategories.js';
import { ROLES } from '../constants/roles.js';
import { BOOKING_RULES } from '../constants/bookingRules.js';

const SORTABLE = ['bookingDate', 'startsAt', 'createdAt', 'status'];
const APPROVER_ROLES = [ROLES.ADMIN, ROLES.STAFF];

// --- helpers ---------------------------------------------------------------

function audit(action, { actor, target, ctx = {}, before, after }) {
  return auditService.record({
    actor: actor?._id || actor || null,
    actorRole: actor?.role,
    actorName: actor?.name,
    action,
    entityType: AUDIT_ENTITY_TYPES.BOOKING,
    entityId: target?._id || target || null,
    before,
    after,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    status: 'success',
    metadata: { requestId: ctx.requestId },
  });
}

function historyEntry(status, actor, reason) {
  return { status, changedBy: actor?._id || null, changedAt: new Date(), reason };
}

async function findBookingOr404(id) {
  const booking = await Booking.findById(id);
  if (!booking) throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  return booking;
}

function isOwner(booking, actor) {
  return booking.user.equals(actor._id);
}
function isAdmin(actor) {
  return actor.role === ROLES.ADMIN;
}

/** Generate the next RF-YYYYMM-NNNN reference (count-based, dup-key retried). */
async function nextBookingRef(bookingDate, session) {
  const d = new Date(bookingDate);
  const ym = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  const prefix = `RF-${ym}-`;
  const count = await Booking.countDocuments({ bookingRef: { $regex: `^${prefix}` } }).session(
    session || null
  );
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Pre-transaction validations that do not need isolation (§19.3 rules 1–12). */
async function validateBookingRules(room, booking, { skipAdvance = false } = {}) {
  if (!room || room.isDeleted || room.status !== ROOM_STATUS.ACTIVE) {
    throw ApiError.unprocessable('Room is not available for booking', 'ROOM_UNAVAILABLE');
  }
  const now = new Date();
  if (booking.startsAt <= now) {
    throw ApiError.unprocessable('Cannot book a time in the past', 'PAST_DATE_NOT_ALLOWED');
  }
  if (!skipAdvance) {
    const maxAdvance = new Date(now.getTime() + BOOKING_RULES.MAX_ADVANCE_DAYS * 86400000);
    if (booking.startsAt > maxAdvance) {
      throw ApiError.unprocessable(
        `Cannot book more than ${BOOKING_RULES.MAX_ADVANCE_DAYS} days in advance`,
        'TOO_FAR_IN_ADVANCE'
      );
    }
  }
  // Operating day + hours.
  const dow = utcDayOfWeek(booking.bookingDate);
  const hours = room.operatingHours || {};
  if (!(hours.days || []).includes(dow)) {
    throw ApiError.unprocessable('Room is closed on this day', 'ROOM_CLOSED_ON_THIS_DAY');
  }
  if (booking.startTime < hours.open || booking.endTime > hours.close) {
    throw ApiError.unprocessable('Outside room operating hours', 'OUTSIDE_OPERATING_HOURS');
  }
  // Blackout dates.
  const day = utcDayStart(booking.bookingDate).getTime();
  const blackout = (room.blackoutDates || []).some(
    (b) => utcDayStart(b.date).getTime() === day
  );
  if (blackout) throw ApiError.unprocessable('Room is unavailable on this date', 'BLACKOUT_DATE');
  // Duration.
  if (booking.durationMinutes < BOOKING_RULES.MIN_DURATION_MIN) {
    throw ApiError.unprocessable(
      `Minimum booking duration is ${BOOKING_RULES.MIN_DURATION_MIN} minutes`,
      'DURATION_TOO_SHORT'
    );
  }
  if (booking.durationMinutes > BOOKING_RULES.MAX_DURATION_MIN) {
    throw ApiError.unprocessable(
      `Maximum booking duration is ${BOOKING_RULES.MAX_DURATION_MIN} minutes`,
      'DURATION_TOO_LONG'
    );
  }
  // Capacity.
  if (booking.attendees > room.capacity) {
    throw ApiError.unprocessable(
      `Attendees (${booking.attendees}) exceed room capacity (${room.capacity})`,
      'EXCEEDS_CAPACITY'
    );
  }
}

// ===========================================================================
// Create
// ===========================================================================

export async function createBooking(dto, actor, ctx) {
  const room = await Room.findById(dto.room);

  // Build the doc first so the model derives startsAt/endsAt/durationMinutes (§7.4).
  const booking = new Booking({
    room: dto.room,
    user: actor._id,
    roomCode: room?.code,
    roomName: room?.name,
    userName: actor.name,
    bookingDate: dto.bookingDate,
    startTime: dto.startTime,
    endTime: dto.endTime,
    purpose: dto.purpose,
    attendees: dto.attendees,
  });
  await booking.validate();

  await validateBookingRules(room, booking);

  // Active-booking cap (§19.3 rule 15) — best-effort pre-check.
  const activeCount = await Booking.countDocuments({
    user: actor._id,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startsAt: { $gt: new Date() },
  });
  if (activeCount >= BOOKING_RULES.MAX_ACTIVE_BOOKINGS) {
    throw ApiError.unprocessable(
      `You already have ${BOOKING_RULES.MAX_ACTIVE_BOOKINGS} active bookings`,
      'BOOKING_LIMIT_REACHED'
    );
  }

  // Auto-approve: admin/staff on rooms not requiring approval (§FR-BOOK-07).
  const autoApprove = APPROVER_ROLES.includes(actor.role) && room.requiresApproval === false;
  const status = autoApprove ? BOOKING_STATUS.APPROVED : BOOKING_STATUS.PENDING;

  // Transactional conflict check + insert, retried on ref collision.
  let created = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      created = await runWithOptionalTransaction(async (session) => {
        const roomConflict = await Booking.findOne(
          roomOverlapFilter(booking.room, booking.startsAt, booking.endsAt)
        ).session(session || null);
        if (roomConflict) {
          const suggestions = await availability.suggestAlternatives(
            booking.room,
            booking.bookingDate,
            booking.durationMinutes,
            booking.startsAt
          );
          throw ApiError.conflict(
            'Room is already booked for this time slot',
            'BOOKING_CONFLICT',
            suggestions.map((s) => ({ field: 'slot', message: `${s.startTime}-${s.endTime}` }))
          );
        }

        const userConflict = await Booking.findOne(
          userOverlapFilter(booking.user, booking.startsAt, booking.endsAt)
        ).session(session || null);
        if (userConflict) {
          throw ApiError.conflict(
            'You already have a booking in this time window',
            'USER_DOUBLE_BOOKING'
          );
        }

        booking.bookingRef = await nextBookingRef(booking.bookingDate, session);
        booking.status = status;
        if (autoApprove) {
          booking.approvedBy = actor._id;
          booking.approvedAt = new Date();
        }
        booking.statusHistory.push(historyEntry(status, actor, autoApprove ? 'Auto-approved' : 'Created'));

        await booking.save({ session: session || undefined });
        await audit(AUDIT_ACTIONS.BOOKING_CREATED, {
          actor, target: booking, ctx, after: { status, ref: booking.bookingRef },
        });
        return booking;
      });
      break;
    } catch (err) {
      if (err?.code === 11000 && err?.keyValue?.bookingRef) continue; // ref race → retry
      throw err;
    }
  }
  if (!created) {
    throw ApiError.conflict('Could not allocate a booking reference, try again', 'REF_ALLOCATION_FAILED');
  }
  // Notifications post-commit — best-effort, must never fail the booking (§2.3, FR-NOTIF-07).
  notification.notifyBookingCreated(created).catch(() => {});
  if (created.status === BOOKING_STATUS.PENDING) {
    notification.notifyApprovalRequest(created).catch(() => {});
  }
  return created;
}

// ===========================================================================
// State transitions
// ===========================================================================

export async function approveBooking(id, remark, actor, ctx) {
  const booking = await findBookingOr404(id);
  assertTransition(booking.status, BOOKING_STATUS.APPROVED);

  const result = await runWithOptionalTransaction(async (session) => {
    // Re-check at approval time — another booking may have been approved meanwhile (§16 step 4).
    const approvedOverlap = await Booking.findOne({
      ...roomOverlapFilter(booking.room, booking.startsAt, booking.endsAt, booking._id),
      status: BOOKING_STATUS.APPROVED,
    }).session(session || null);
    if (approvedOverlap) {
      throw ApiError.conflict(
        `Slot already approved for ${approvedOverlap.bookingRef}`,
        'BOOKING_CONFLICT'
      );
    }

    booking.status = BOOKING_STATUS.APPROVED;
    booking.approvedBy = actor._id;
    booking.approvedAt = new Date();
    booking.approvalRemark = remark || null;
    booking.statusHistory.push(historyEntry(BOOKING_STATUS.APPROVED, actor, remark));
    await booking.save({ session: session || undefined });

    // Auto-reject other pending bookings overlapping the same slot (§16 step 5b).
    await Booking.updateMany(
      {
        room: booking.room,
        _id: { $ne: booking._id },
        status: BOOKING_STATUS.PENDING,
        startsAt: { $lt: booking.endsAt },
        endsAt: { $gt: booking.startsAt },
      },
      {
        $set: { status: BOOKING_STATUS.REJECTED, rejectionReason: 'Auto-rejected: slot approved for another booking' },
        $push: { statusHistory: historyEntry(BOOKING_STATUS.REJECTED, actor, 'Auto-rejected') },
      },
      { session: session || undefined }
    );

    await audit(AUDIT_ACTIONS.BOOKING_APPROVED, { actor, target: booking, ctx });
    return booking;
  });
  // Approval email (+.ics) + in-app, post-commit best-effort.
  notification.notifyBookingApproved(result).catch(() => {});
  return result;
}

export async function rejectBooking(id, reason, actor, ctx) {
  const booking = await findBookingOr404(id);
  assertTransition(booking.status, BOOKING_STATUS.REJECTED);
  booking.status = BOOKING_STATUS.REJECTED;
  booking.rejectionReason = reason;
  booking.statusHistory.push(historyEntry(BOOKING_STATUS.REJECTED, actor, reason));
  await booking.save();
  await audit(AUDIT_ACTIONS.BOOKING_REJECTED, { actor, target: booking, ctx });
  notification.notifyBookingRejected(booking).catch(() => {});
  return booking;
}

export async function cancelBooking(id, reason, actor, ctx) {
  const booking = await findBookingOr404(id);
  if (!isOwner(booking, actor) && !isAdmin(actor)) {
    throw ApiError.forbidden('You cannot cancel this booking', 'NOT_OWNER');
  }
  assertTransition(booking.status, BOOKING_STATUS.CANCELLED);
  // Owner may cancel only before start; admin may cancel anytime (§FR-BOOK-09/10).
  if (booking.status === BOOKING_STATUS.APPROVED && !isAdmin(actor) && booking.startsAt <= new Date()) {
    throw ApiError.unprocessable('Cannot cancel a booking that has started', 'CANNOT_CANCEL_STARTED_BOOKING');
  }
  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledBy = actor._id;
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || null;
  booking.statusHistory.push(historyEntry(BOOKING_STATUS.CANCELLED, actor, reason));
  await booking.save();
  await audit(AUDIT_ACTIONS.BOOKING_CANCELLED, { actor, target: booking, ctx });
  notification.notifyBookingCancelled(booking).catch(() => {});
  return booking;
}

export async function completeBooking(id, actor, ctx) {
  const booking = await findBookingOr404(id);
  assertTransition(booking.status, BOOKING_STATUS.COMPLETED);
  booking.status = BOOKING_STATUS.COMPLETED;
  booking.statusHistory.push(historyEntry(BOOKING_STATUS.COMPLETED, actor, 'Completed'));
  await booking.save();
  await audit(AUDIT_ACTIONS.BOOKING_COMPLETED, { actor, target: booking, ctx });
  return booking;
}

export async function rescheduleBooking(id, dto, actor, ctx) {
  const booking = await findBookingOr404(id);
  if (!isOwner(booking, actor)) throw ApiError.forbidden('You cannot edit this booking', 'NOT_OWNER');
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw ApiError.unprocessable('Only pending bookings can be rescheduled', 'EDIT_NOT_ALLOWED');
  }
  const room = await Room.findById(booking.room);

  booking.bookingDate = dto.bookingDate;
  booking.startTime = dto.startTime;
  booking.endTime = dto.endTime;
  await booking.validate(); // re-derive times
  await validateBookingRules(room, booking);

  return runWithOptionalTransaction(async (session) => {
    const conflict = await Booking.findOne(
      roomOverlapFilter(booking.room, booking.startsAt, booking.endsAt, booking._id)
    ).session(session || null);
    if (conflict) {
      const suggestions = await availability.suggestAlternatives(
        booking.room, booking.bookingDate, booking.durationMinutes, booking.startsAt
      );
      throw ApiError.conflict('Room is already booked for this time slot', 'BOOKING_CONFLICT',
        suggestions.map((s) => ({ field: 'slot', message: `${s.startTime}-${s.endTime}` })));
    }
    booking.statusHistory.push(historyEntry(booking.status, actor, 'Rescheduled'));
    await booking.save({ session: session || undefined });
    await audit(AUDIT_ACTIONS.BOOKING_RESCHEDULED, { actor, target: booking, ctx });
    return booking;
  });
}

// ===========================================================================
// Dry-run conflict check (§10.4 POST /bookings/check-conflict)
// ===========================================================================

export async function checkConflict(dto) {
  const probe = new Booking({
    room: dto.room,
    user: dto.user || undefined,
    bookingDate: dto.bookingDate,
    startTime: dto.startTime,
    endTime: dto.endTime,
    purpose: 'conflict-probe-conflict-probe',
    attendees: 1,
  });
  await probe.validate();

  const conflict = await Booking.findOne(
    roomOverlapFilter(dto.room, probe.startsAt, probe.endsAt, dto.excludeId)
  )
    .select('bookingRef status startTime endTime')
    .lean();

  if (!conflict) return { conflict: false };
  const suggestions = await availability.suggestAlternatives(
    dto.room, probe.bookingDate, probe.durationMinutes, probe.startsAt
  );
  return { conflict: true, conflictingRef: conflict.bookingRef, suggestions };
}

// ===========================================================================
// Reads (scoped by role)
// ===========================================================================

function scopeFilter(query, actor) {
  const filter = {};
  // Students/guests see only their own bookings; staff/admin see all (§10.4).
  if (!APPROVER_ROLES.includes(actor.role)) filter.user = actor._id;
  else if (query.user) filter.user = query.user;

  if (query.status) filter.status = query.status;
  if (query.room) filter.room = query.room;
  if (query.from || query.to) {
    filter.bookingDate = {};
    if (query.from) filter.bookingDate.$gte = utcDayStart(query.from);
    if (query.to) filter.bookingDate.$lte = utcDayStart(query.to);
  }
  return filter;
}

export async function listBookings(query, actor) {
  const { page, limit, skip } = getPagination(query);
  const sort = parseSort(query.sort, SORTABLE, { startsAt: -1 });
  const filter = scopeFilter(query, actor);
  const [bookings, total] = await Promise.all([
    Booking.find(filter).select('-__v -statusHistory').sort(sort).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);
  return { bookings, meta: buildMeta(total, page, limit) };
}

export async function myBookings(query, actor) {
  const { page, limit, skip } = getPagination(query);
  const sort = parseSort(query.sort, SORTABLE, { startsAt: -1 });
  const filter = { user: actor._id };
  if (query.status) filter.status = query.status;
  const [bookings, total] = await Promise.all([
    Booking.find(filter).select('-__v -statusHistory').sort(sort).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);
  return { bookings, meta: buildMeta(total, page, limit) };
}

export async function pendingBookings(query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { status: BOOKING_STATUS.PENDING };
  if (query.room) filter.room = query.room;
  const [bookings, total] = await Promise.all([
    Booking.find(filter).select('-__v -statusHistory').sort({ startsAt: 1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments(filter),
  ]);
  return { bookings, meta: buildMeta(total, page, limit) };
}

export async function getBookingById(id, actor) {
  const booking = await Booking.findById(id).select('-__v');
  if (!booking) throw ApiError.notFound('Booking not found', 'BOOKING_NOT_FOUND');
  if (!APPROVER_ROLES.includes(actor.role) && !booking.user.equals(actor._id)) {
    throw ApiError.forbidden('You cannot view this booking', 'NOT_OWNER'); // anti-IDOR (§11.5)
  }
  return booking;
}

export async function calendarFeed(query, actor) {
  const filter = scopeFilter(query, actor);
  // Calendar is bounded by a date range; return a lightweight event shape.
  const events = await Booking.find({
    ...filter,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
  })
    .select('bookingRef room roomName status startsAt endsAt startTime endTime bookingDate')
    .sort({ startsAt: 1 })
    .lean();
  return events;
}

export default {
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
  checkConflict,
  listBookings,
  myBookings,
  pendingBookings,
  getBookingById,
  calendarFeed,
};
