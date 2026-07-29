/**
 * Notification service — ARCHITECTURE.md §6, §10.7, §18.4, §21.4.
 *
 * Persists in-app notifications (the bell) and fires email asynchronously. Email
 * NEVER blocks or fails the caller (§2.3, FR-NOTIF-07); emailStatus is tracked on
 * the document. Domain helpers (notifyBooking*) build the right title/message +
 * template and are called post-commit by the booking service.
 */
import { Notification } from '../models/Notification.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { generateICS, icsAttachment } from '../utils/icsGenerator.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  EMAIL_STATUS,
  NOTIFICATION_PRIORITY,
} from '../constants/notificationTypes.js';
import { ROLES } from '../constants/roles.js';

import { sendTemplatedEmail } from './email.service.js';

// --- core ------------------------------------------------------------------

/**
 * Create one in-app notification; optionally send an email (fire-and-forget).
 * @param {object} p
 * @param {object} [p.recipientUser]  loaded user (for email + prefs)
 * @param {string} [p.recipientId]    when the user object is not to hand
 * @param {string} p.type
 * @param {string} p.title
 * @param {string} p.message
 * @param {string} [p.relatedBooking]
 * @param {string} [p.link]
 * @param {string} [p.priority]
 * @param {object} [p.email]          { template, subject, data, attachments }
 */
export async function createNotification(p) {
  const recipient = p.recipientId || p.recipientUser?._id;
  if (!recipient) throw ApiError.badRequest('Notification recipient required', 'NO_RECIPIENT');

  const prefsAllowEmail = p.recipientUser
    ? p.recipientUser.notificationPreferences?.email !== false
    : true;
  const wantEmail = Boolean(p.email && p.recipientUser?.email && prefsAllowEmail);

  const doc = await Notification.create({
    recipient,
    type: p.type,
    title: p.title,
    message: p.message,
    relatedBooking: p.relatedBooking || null,
    link: p.link || null,
    channel: wantEmail ? NOTIFICATION_CHANNELS.BOTH : NOTIFICATION_CHANNELS.IN_APP,
    emailStatus: wantEmail ? EMAIL_STATUS.PENDING : undefined,
    priority: p.priority || NOTIFICATION_PRIORITY.NORMAL,
  });

  if (wantEmail) {
    sendTemplatedEmail(p.email.template, {
      to: p.recipientUser.email,
      subject: p.email.subject,
      data: p.email.data,
      attachments: p.email.attachments,
    })
      .then((r) =>
        Notification.updateOne(
          { _id: doc._id },
          { $set: { emailStatus: r.status === 'sent' ? EMAIL_STATUS.SENT : EMAIL_STATUS.FAILED, emailError: r.error || null } }
        ).catch(() => {})
      )
      .catch((e) => logger.warn('notification email failed', { error: e.message }));
  }

  return doc;
}

// --- domain helpers (called post-commit by booking.service / jobs) ---------

function bookingData(b) {
  return {
    userName: b.userName,
    bookingRef: b.bookingRef,
    roomName: b.roomName,
    roomCode: b.roomCode,
    date: new Date(b.bookingDate).toISOString().slice(0, 10),
    startTime: b.startTime,
    endTime: b.endTime,
    purpose: b.purpose,
  };
}

async function recipientOf(booking) {
  return User.findById(booking.user).select('name email notificationPreferences');
}

export async function notifyBookingCreated(booking) {
  const user = await recipientOf(booking);
  if (!user) return;
  return createNotification({
    recipientUser: user,
    type: NOTIFICATION_TYPES.BOOKING_CREATED,
    title: 'Booking request received',
    message: `Your booking ${booking.bookingRef} for ${booking.roomName} is pending approval.`,
    relatedBooking: booking._id,
    link: `/bookings/${booking._id}`,
    email: { template: 'bookingConfirmation', subject: `Booking received — ${booking.bookingRef}`, data: bookingData(booking) },
  });
}

export async function notifyApprovalRequest(booking) {
  // In-app to all admins (FR-NOTIF-04, "should").
  const admins = await User.find({ role: ROLES.ADMIN, isBlocked: false }).select('_id').lean();
  await Promise.all(
    admins.map((a) =>
      createNotification({
        recipientId: a._id,
        type: NOTIFICATION_TYPES.APPROVAL_REQUEST,
        title: 'Booking awaiting approval',
        message: `${booking.userName} requested ${booking.roomName} (${booking.bookingRef}).`,
        relatedBooking: booking._id,
        link: `/bookings/${booking._id}`,
        priority: NOTIFICATION_PRIORITY.HIGH,
      })
    )
  );
}

export async function notifyBookingApproved(booking) {
  const user = await recipientOf(booking);
  if (!user) return;
  const ics = generateICS({
    uid: booking.bookingRef,
    start: booking.startsAt,
    end: booking.endsAt,
    summary: `Room booking ${booking.roomName}`,
    description: booking.purpose,
    location: `${booking.roomName} (${booking.roomCode})`,
  });
  return createNotification({
    recipientUser: user,
    type: NOTIFICATION_TYPES.BOOKING_APPROVED,
    title: 'Booking approved',
    message: `Your booking ${booking.bookingRef} for ${booking.roomName} was approved.`,
    relatedBooking: booking._id,
    link: `/bookings/${booking._id}`,
    email: {
      template: 'bookingApproved',
      subject: `Booking approved — ${booking.bookingRef}`,
      data: { ...bookingData(booking), remark: booking.approvalRemark },
      attachments: [icsAttachment(ics)],
    },
  });
}

export async function notifyBookingRejected(booking) {
  const user = await recipientOf(booking);
  if (!user) return;
  return createNotification({
    recipientUser: user,
    type: NOTIFICATION_TYPES.BOOKING_REJECTED,
    title: 'Booking rejected',
    message: `Your booking ${booking.bookingRef} was rejected.`,
    relatedBooking: booking._id,
    link: `/bookings/${booking._id}`,
    email: {
      template: 'bookingRejected',
      subject: `Booking rejected — ${booking.bookingRef}`,
      data: { ...bookingData(booking), reason: booking.rejectionReason },
    },
  });
}

export async function notifyBookingCancelled(booking) {
  const user = await recipientOf(booking);
  if (!user) return;
  return createNotification({
    recipientUser: user,
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title: 'Booking cancelled',
    message: `Booking ${booking.bookingRef} for ${booking.roomName} was cancelled.`,
    relatedBooking: booking._id,
    link: `/bookings/${booking._id}`,
  });
}

export async function notifyBookingReminder(booking) {
  const user = await recipientOf(booking);
  if (!user) return;
  return createNotification({
    recipientUser: user,
    type: NOTIFICATION_TYPES.BOOKING_REMINDER,
    title: 'Upcoming booking reminder',
    message: `Your booking ${booking.bookingRef} for ${booking.roomName} starts soon.`,
    relatedBooking: booking._id,
    link: `/bookings/${booking._id}`,
    email: { template: 'bookingReminder', subject: `Reminder — ${booking.bookingRef}`, data: bookingData(booking) },
  });
}

// --- user-facing operations (§10.7) ----------------------------------------

export async function listMine(userId, query) {
  const { page, limit, skip } = getPagination(query);
  const filter = { recipient: userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead;
  if (query.type) filter.type = query.type;
  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export function unreadCount(userId) {
  return Notification.countDocuments({ recipient: userId, isRead: false });
}

export async function getMine(id, userId) {
  const n = await Notification.findOne({ _id: id, recipient: userId });
  if (!n) throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
  return n;
}

export async function markRead(id, userId) {
  const res = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );
  if (!res) throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
  return res;
}

export function markAllRead(userId) {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
}

export async function remove(id, userId) {
  const res = await Notification.deleteOne({ _id: id, recipient: userId });
  if (res.deletedCount === 0) throw ApiError.notFound('Notification not found', 'NOTIFICATION_NOT_FOUND');
}

export function clearRead(userId) {
  return Notification.deleteMany({ recipient: userId, isRead: true });
}

/** Admin broadcast to a role (or everyone). */
export async function broadcast({ role, title, message, priority }, _actor) {
  const filter = { isBlocked: false, isDeleted: false };
  if (role && role !== 'all') filter.role = role;
  const users = await User.find(filter).select('_id').lean();
  if (users.length === 0) return { sent: 0 };
  const docs = users.map((u) => ({
    recipient: u._id,
    type: NOTIFICATION_TYPES.BROADCAST,
    title,
    message,
    channel: NOTIFICATION_CHANNELS.IN_APP,
    priority: priority || NOTIFICATION_PRIORITY.NORMAL,
  }));
  await Notification.insertMany(docs);
  return { sent: docs.length };
}

/** Update the authenticated user's notification preferences. */
export async function updatePreferences(userId, prefs) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  if (prefs.email !== undefined) user.notificationPreferences.email = prefs.email;
  if (prefs.inApp !== undefined) user.notificationPreferences.inApp = prefs.inApp;
  await user.save({ validateBeforeSave: false });
  return user.notificationPreferences;
}

export default {
  createNotification,
  notifyBookingCreated,
  notifyApprovalRequest,
  notifyBookingApproved,
  notifyBookingRejected,
  notifyBookingCancelled,
  notifyBookingReminder,
  listMine,
  unreadCount,
  getMine,
  markRead,
  markAllRead,
  remove,
  clearRead,
  broadcast,
  updatePreferences,
};
