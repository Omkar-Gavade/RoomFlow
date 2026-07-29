/**
 * Report service — ARCHITECTURE.md §10.6, §FR-REP, §24.
 *
 * All reports computed via MongoDB aggregation (FR-REP-06), not in Node memory.
 * $match precedes $group so pipelines use indexes (§24.1). Read-only.
 */
import { Booking } from '../models/Booking.model.js';
import { Room } from '../models/Room.model.js';
import { utcDayStart } from '../utils/bookingTime.js';
import { BOOKING_STATUS, BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';

const DAY_MS = 86400000;
const USAGE_STATUSES = [BOOKING_STATUS.APPROVED, BOOKING_STATUS.COMPLETED];
const hhmmToMinutes = (s) => {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + m;
};

/** [start, end) UTC day bounds from a from/to pair. */
function dayRange(from, to) {
  const start = utcDayStart(from);
  const end = new Date(utcDayStart(to).getTime() + DAY_MS);
  return { start, end };
}

async function statusBreakdown(match) {
  const agg = await Booking.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [a._id, a.count]));
  return BOOKING_STATUS_VALUES.reduce((acc, s) => ({ ...acc, [s]: map.get(s) || 0 }), {});
}

async function dailyTrend(start, end) {
  const agg = await Booking.aggregate([
    { $match: { bookingDate: { $gte: start, $lt: end } } },
    { $group: { _id: '$bookingDate', count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [new Date(a._id).getTime(), a.count]));
  const out = [];
  for (let t = start.getTime(); t < end.getTime(); t += DAY_MS) {
    out.push({ date: new Date(t).toISOString().slice(0, 10), count: map.get(t) || 0 });
  }
  return out;
}

async function rangeSummary(start, end) {
  const match = { bookingDate: { $gte: start, $lt: end } };
  const [total, byStatus, trend] = await Promise.all([
    Booking.countDocuments(match),
    statusBreakdown(match),
    dailyTrend(start, end),
  ]);
  return { total, byStatus, trend };
}

// --- Time-bucket reports ---------------------------------------------------

export async function daily(date) {
  const start = utcDayStart(date);
  const end = new Date(start.getTime() + DAY_MS);
  const match = { bookingDate: { $gte: start, $lt: end } };
  const [total, byStatus, bookings] = await Promise.all([
    Booking.countDocuments(match),
    statusBreakdown(match),
    Booking.find(match)
      .select('bookingRef roomName userName status startTime endTime attendees')
      .sort({ startsAt: 1 })
      .lean(),
  ]);
  return { date: start.toISOString().slice(0, 10), total, byStatus, bookings };
}

export async function weekly(weekStart) {
  const start = utcDayStart(weekStart);
  const end = new Date(start.getTime() + 7 * DAY_MS);
  return { weekStart: start.toISOString().slice(0, 10), ...(await rangeSummary(start, end)) };
}

export async function monthly(month) {
  const [y, m] = String(month).split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { month, ...(await rangeSummary(start, end)) };
}

// --- Analytical reports ----------------------------------------------------

function operatingDaysInRange(days, start, end) {
  let count = 0;
  for (let t = start.getTime(); t < end.getTime(); t += DAY_MS) {
    if (days.includes(new Date(t).getUTCDay())) count += 1;
  }
  return count;
}

export async function utilization({ from, to, roomId, groupBy = 'room' }) {
  const { start, end } = dayRange(from, to);
  const roomFilter = { isDeleted: false };
  if (roomId) roomFilter._id = roomId;

  const [rooms, booked] = await Promise.all([
    Room.find(roomFilter).select('code name category building operatingHours').lean(),
    Booking.aggregate([
      { $match: { bookingDate: { $gte: start, $lt: end }, status: { $in: USAGE_STATUSES }, ...(roomId ? { room: roomId } : {}) } },
      { $group: { _id: '$room', minutes: { $sum: '$durationMinutes' } } },
    ]),
  ]);
  const bookedMap = new Map(booked.map((b) => [String(b._id), b.minutes]));

  const perRoom = rooms.map((r) => {
    const h = r.operatingHours || {};
    const perDay = h.open && h.close ? hhmmToMinutes(h.close) - hhmmToMinutes(h.open) : 0;
    const availableMinutes = perDay * operatingDaysInRange(h.days || [], start, end);
    const bookedMinutes = bookedMap.get(String(r._id)) || 0;
    return {
      roomId: r._id, code: r.code, name: r.name, category: r.category, building: r.building,
      bookedMinutes, availableMinutes,
      utilization: availableMinutes ? Math.round((bookedMinutes / availableMinutes) * 100) : 0,
    };
  });

  if (groupBy === 'room') return perRoom;

  const groups = new Map();
  for (const r of perRoom) {
    const g = r[groupBy];
    const cur = groups.get(g) || { group: g, bookedMinutes: 0, availableMinutes: 0 };
    cur.bookedMinutes += r.bookedMinutes;
    cur.availableMinutes += r.availableMinutes;
    groups.set(g, cur);
  }
  return [...groups.values()].map((x) => ({
    ...x,
    utilization: x.availableMinutes ? Math.round((x.bookedMinutes / x.availableMinutes) * 100) : 0,
  }));
}

export async function mostBooked({ from, to, limit = 10 }) {
  const { start, end } = dayRange(from, to);
  const agg = await Booking.aggregate([
    { $match: { bookingDate: { $gte: start, $lt: end }, status: { $in: USAGE_STATUSES } } },
    { $group: { _id: '$room', roomName: { $first: '$roomName' }, roomCode: { $first: '$roomCode' }, bookings: { $sum: 1 }, minutes: { $sum: '$durationMinutes' } } },
    { $sort: { bookings: -1 } },
    { $limit: limit },
  ]);
  return agg.map((a) => ({ roomId: a._id, roomName: a.roomName, roomCode: a.roomCode, bookings: a.bookings, minutes: a.minutes }));
}

export async function peakHours({ from, to }) {
  const { start, end } = dayRange(from, to);
  const agg = await Booking.aggregate([
    { $match: { startsAt: { $gte: start, $lt: end }, status: { $in: USAGE_STATUSES } } },
    { $group: { _id: { $hour: { date: '$startsAt', timezone: 'UTC' } }, count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [a._id, a.count]));
  return Array.from({ length: 24 }, (_, hour) => ({ hour, count: map.get(hour) || 0 }));
}

export async function userActivity({ from, to }) {
  const { start, end } = dayRange(from, to);
  const agg = await Booking.aggregate([
    { $match: { bookingDate: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: '$user',
        userName: { $first: '$userName' },
        total: { $sum: 1 },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', BOOKING_STATUS.APPROVED] }, 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 100 },
  ]);
  return agg.map((a) => ({
    userId: a._id, userName: a.userName, total: a.total, cancelled: a.cancelled, approved: a.approved,
    cancellationRate: a.total ? Math.round((a.cancelled / a.total) * 100) : 0,
  }));
}

export async function cancellations({ from, to }) {
  const { start, end } = dayRange(from, to);
  const statuses = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.EXPIRED];
  const agg = await Booking.aggregate([
    { $match: { bookingDate: { $gte: start, $lt: end }, status: { $in: statuses } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(agg.map((a) => [a._id, a.count]));
  const byStatus = statuses.reduce((acc, s) => ({ ...acc, [s]: map.get(s) || 0 }), {});
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  return { byStatus, total };
}

/** Rows for CSV export by report type. */
export async function exportRows(type, params) {
  switch (type) {
    case 'utilization':
      return { rows: await utilization(params), columns: [
        { key: 'code', label: 'Code' }, { key: 'name', label: 'Room' }, { key: 'group', label: 'Group' },
        { key: 'bookedMinutes', label: 'Booked Minutes' }, { key: 'availableMinutes', label: 'Available Minutes' }, { key: 'utilization', label: 'Utilization %' },
      ] };
    case 'most-booked':
      return { rows: await mostBooked(params), columns: [
        { key: 'roomCode', label: 'Code' }, { key: 'roomName', label: 'Room' }, { key: 'bookings', label: 'Bookings' }, { key: 'minutes', label: 'Minutes' },
      ] };
    case 'user-activity':
      return { rows: await userActivity(params), columns: [
        { key: 'userName', label: 'User' }, { key: 'total', label: 'Total' }, { key: 'approved', label: 'Approved' }, { key: 'cancelled', label: 'Cancelled' }, { key: 'cancellationRate', label: 'Cancellation %' },
      ] };
    case 'peak-hours':
      return { rows: await peakHours(params), columns: [{ key: 'hour', label: 'Hour' }, { key: 'count', label: 'Bookings' }] };
    default:
      return null;
  }
}

export default { daily, weekly, monthly, utilization, mostBooked, peakHours, userActivity, cancellations, exportRows };
