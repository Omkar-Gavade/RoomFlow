/**
 * Availability service — ARCHITECTURE.md §10.3 (availability), §20.5 (suggestions).
 *
 * Read-only computation of free/busy time from the Booking collection. Unblocks
 * the Phase 2 room-availability endpoints. NOT the conflict engine — it presents
 * availability; the write-time guarantee lives in booking.service (§20.4).
 */
import { Room } from '../models/Room.model.js';
import { Booking } from '../models/Booking.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  toUtcDateTime,
  utcDayStart,
  utcDayOfWeek,
  toHHMM,
  minutesBetween,
} from '../utils/bookingTime.js';
import { ACTIVE_BOOKING_STATUSES } from '../constants/bookingStatus.js';
import { ROOM_STATUS } from '../constants/roomCategories.js';

/** Compute the free gaps between busy intervals within [dayStart, dayEnd]. */
function computeFreeSegments(dayStart, dayEnd, busySorted) {
  const free = [];
  let cursor = dayStart;
  for (const b of busySorted) {
    if (b.startsAt > cursor) free.push({ startsAt: cursor, endsAt: b.startsAt });
    if (b.endsAt > cursor) cursor = b.endsAt;
  }
  if (cursor < dayEnd) free.push({ startsAt: cursor, endsAt: dayEnd });
  return free.filter((s) => s.endsAt > s.startsAt);
}

/**
 * Free/busy for one room on one day.
 * @returns {Promise<object>} { date, closed, operatingHours, busy[], free[] }
 */
export async function getRoomAvailability(roomId, dateInput) {
  const room = await Room.findById(roomId);
  if (!room) throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');

  const day = utcDayStart(dateInput);
  const dow = utcDayOfWeek(dateInput);
  const hours = room.operatingHours || {};
  const openDays = hours.days || [];

  const base = {
    date: day.toISOString().slice(0, 10),
    roomId: room._id,
    operatingHours: { open: hours.open, close: hours.close, days: openDays },
  };

  if (room.status !== ROOM_STATUS.ACTIVE || !openDays.includes(dow)) {
    return { ...base, closed: true, busy: [], free: [] };
  }

  const dayStart = toUtcDateTime(dateInput, hours.open);
  const dayEnd = toUtcDateTime(dateInput, hours.close);

  const bookings = await Booking.find({
    room: roomId,
    bookingDate: day,
    status: { $in: ACTIVE_BOOKING_STATUSES },
  })
    .select('bookingRef status startsAt endsAt startTime endTime')
    .sort({ startsAt: 1 })
    .lean();

  const busy = bookings.map((b) => ({
    bookingRef: b.bookingRef,
    status: b.status,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    startTime: b.startTime,
    endTime: b.endTime,
  }));

  const free = computeFreeSegments(dayStart, dayEnd, busy).map((s) => ({
    startTime: toHHMM(s.startsAt),
    endTime: toHHMM(s.endsAt),
    startsAt: s.startsAt,
    endsAt: s.endsAt,
  }));

  return { ...base, closed: false, busy, free };
}

/**
 * Suggest up to `limit` free slots that fit `durationMin`, closest to `aroundStartsAt`.
 * Used to give a conflict a recovery path (§20.5, skill: Error Recovery).
 */
export async function suggestAlternatives(roomId, dateInput, durationMin, aroundStartsAt, limit = 3) {
  const { free } = await getRoomAvailability(roomId, dateInput);
  const fits = free
    .filter((s) => minutesBetween(s.startsAt, s.endsAt) >= durationMin)
    .map((s) => ({
      startTime: s.startTime,
      endTime: toHHMM(new Date(s.startsAt.getTime() + durationMin * 60000)),
      distance: Math.abs(s.startsAt.getTime() - new Date(aroundStartsAt).getTime()),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ startTime, endTime }) => ({ startTime, endTime }));
  return fits;
}

/**
 * Rooms free for a window (§10.3 GET /rooms/available). Filters by capacity,
 * facilities, operating hours/day, then removes rooms with an overlapping booking.
 */
export async function findAvailableRooms({ date, startTime, endTime, capacity, facilities }) {
  const startsAt = toUtcDateTime(date, startTime);
  const endsAt = toUtcDateTime(date, endTime);
  const dow = utcDayOfWeek(date);

  const roomFilter = { isDeleted: false, status: ROOM_STATUS.ACTIVE };
  if (capacity) roomFilter.capacity = { $gte: capacity };
  if (facilities?.length) roomFilter.facilities = { $all: facilities };
  roomFilter['operatingHours.days'] = dow;
  roomFilter['operatingHours.open'] = { $lte: startTime };
  roomFilter['operatingHours.close'] = { $gte: endTime };

  const candidates = await Room.find(roomFilter)
    .select('code name category capacity building floor facilities images operatingHours')
    .lean();
  if (candidates.length === 0) return [];

  const ids = candidates.map((r) => r._id);
  const busyRoomIds = await Booking.distinct('room', {
    room: { $in: ids },
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  });
  const busySet = new Set(busyRoomIds.map((id) => String(id)));

  return candidates.filter((r) => !busySet.has(String(r._id)));
}

export default { getRoomAvailability, suggestAlternatives, findAvailableRooms };
