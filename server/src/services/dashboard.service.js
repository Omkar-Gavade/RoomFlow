/**
 * Dashboard service — ARCHITECTURE.md §10.5, §1.4 (FR-DASH), §24.
 *
 * One aggregate call per role (FR-DASH-04) — NEVER N calls to build one screen.
 * All computation is server-side via aggregation pipelines + counts run
 * concurrently with Promise.all (§24.2). Read-only; no writes, no new schema.
 */
import { Booking } from '../models/Booking.model.js';
import { Room } from '../models/Room.model.js';
import { User } from '../models/User.model.js';
import { Notification } from '../models/Notification.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { utcDayStart, utcDayOfWeek } from '../utils/bookingTime.js';
import { BOOKING_STATUS, BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';
import { ROOM_STATUS } from '../constants/roomCategories.js';

const DAY_MS = 86400000;
const hhmmToMinutes = (s) => {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + m;
};

/** Today's UTC bounds. */
function todayBounds() {
  const start = utcDayStart(new Date());
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

/** Booking count grouped by status, zero-filled for every status. */
async function statusBreakdown(match = {}) {
  const agg = await Booking.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [a._id, a.count]));
  return BOOKING_STATUS_VALUES.reduce((acc, s) => ({ ...acc, [s]: map.get(s) || 0 }), {});
}

/** Bookings per day for the last 7 days (zero-filled). */
async function bookingTrend7d() {
  const start = utcDayStart(new Date());
  const from = new Date(start.getTime() - 6 * DAY_MS);
  const agg = await Booking.aggregate([
    { $match: { bookingDate: { $gte: from, $lte: start } } },
    { $group: { _id: '$bookingDate', count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [new Date(a._id).getTime(), a.count]));
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(start.getTime() - i * DAY_MS);
    trend.push({ date: d.toISOString().slice(0, 10), count: map.get(d.getTime()) || 0 });
  }
  return trend;
}

/** Utilisation % for today = booked approved minutes ÷ available operating minutes. */
async function utilizationToday() {
  const { start } = todayBounds();
  const dow = utcDayOfWeek(new Date());
  const [rooms, bookedAgg] = await Promise.all([
    Room.find({ isDeleted: false, status: ROOM_STATUS.ACTIVE }).select('operatingHours').lean(),
    Booking.aggregate([
      { $match: { bookingDate: start, status: BOOKING_STATUS.APPROVED } },
      { $group: { _id: null, total: { $sum: '$durationMinutes' } } },
    ]),
  ]);
  let availableMin = 0;
  for (const r of rooms) {
    const h = r.operatingHours;
    if (h?.days?.includes(dow) && h.open && h.close) {
      availableMin += hhmmToMinutes(h.close) - hhmmToMinutes(h.open);
    }
  }
  const bookedMin = bookedAgg[0]?.total || 0;
  return availableMin > 0 ? Math.round((bookedMin / availableMin) * 100) : 0;
}

// ===========================================================================
// Admin (single payload — FR-DASH-01/04)
// ===========================================================================
export async function adminDashboard() {
  const { start, end } = todayBounds();
  const [
    totalRooms,
    totalUsers,
    pendingApprovals,
    activeToday,
    utilization,
    trend,
    statuses,
    recentPending,
  ] = await Promise.all([
    Room.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: false }),
    Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ status: BOOKING_STATUS.APPROVED, bookingDate: { $gte: start, $lt: end } }),
    utilizationToday(),
    bookingTrend7d(),
    statusBreakdown(),
    Booking.find({ status: BOOKING_STATUS.PENDING })
      .select('bookingRef roomName userName bookingDate startTime endTime')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    kpis: { totalRooms, totalUsers, pendingApprovals, activeBookingsToday: activeToday, utilizationToday: utilization },
    bookingTrend: trend,
    statusBreakdown: statuses,
    pendingQueue: recentPending,
  };
}

// ===========================================================================
// Staff (FR-DASH-02)
// ===========================================================================
export async function staffDashboard(actor) {
  const { start, end } = todayBounds();
  const now = new Date();
  const [myUpcomingCount, awaitingApproval, todayCount, myUpcoming, approvalQueue] = await Promise.all([
    Booking.countDocuments({ user: actor._id, status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] }, startsAt: { $gt: now } }),
    Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ status: BOOKING_STATUS.APPROVED, bookingDate: { $gte: start, $lt: end } }),
    Booking.find({ user: actor._id, status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] }, startsAt: { $gt: now } })
      .select('bookingRef roomName status bookingDate startTime endTime')
      .sort({ startsAt: 1 })
      .limit(5)
      .lean(),
    Booking.find({ status: BOOKING_STATUS.PENDING })
      .select('bookingRef roomName userName bookingDate startTime endTime')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    kpis: { myUpcoming: myUpcomingCount, awaitingApproval, bookingsToday: todayCount },
    myUpcoming,
    approvalQueue,
  };
}

// ===========================================================================
// Student (FR-DASH-03)
// ===========================================================================
export async function studentDashboard(actor) {
  const now = new Date();
  const monthStart = utcDayStart(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [upcomingCount, pendingCount, thisMonth, upcoming, notifications] = await Promise.all([
    Booking.countDocuments({ user: actor._id, status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] }, startsAt: { $gt: now } }),
    Booking.countDocuments({ user: actor._id, status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ user: actor._id, bookingDate: { $gte: monthStart, $lt: monthEnd } }),
    Booking.find({ user: actor._id, status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] }, startsAt: { $gt: now } })
      .select('bookingRef roomName status bookingDate startTime endTime')
      .sort({ startsAt: 1 })
      .limit(5)
      .lean(),
    Notification.find({ recipient: actor._id })
      .select('type title message isRead createdAt link')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    kpis: { upcomingBookings: upcomingCount, pendingRequests: pendingCount, thisMonth },
    upcoming,
    recentNotifications: notifications,
  };
}

// ===========================================================================
// Lightweight KPI tiles (role-scoped) — §10.5 GET /dashboard/stats
// ===========================================================================
export async function stats(actor) {
  const isPrivileged = actor.role === 'admin' || actor.role === 'staff';
  if (isPrivileged) {
    const [pending, rooms, users] = await Promise.all([
      Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
      Room.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false }),
    ]);
    return { pendingApprovals: pending, totalRooms: rooms, totalUsers: users };
  }
  const now = new Date();
  const [upcoming, pending] = await Promise.all([
    Booking.countDocuments({ user: actor._id, status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] }, startsAt: { $gt: now } }),
    Booking.countDocuments({ user: actor._id, status: BOOKING_STATUS.PENDING }),
  ]);
  return { upcomingBookings: upcoming, pendingRequests: pending };
}

// ===========================================================================
// Recent activity feed (admin) — §10.5 GET /dashboard/activity
// ===========================================================================
export async function activity(limit = 10) {
  return AuditLog.find()
    .select('actorName actorRole action entityType entityId status createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export default { adminDashboard, staffDashboard, studentDashboard, stats, activity };
