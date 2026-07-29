/**
 * Demo seeder — ARCHITECTURE.md §6, risk R12.
 *
 * Creates a realistic institution: users across all roles, a room catalogue, and
 * a spread of bookings (past/completed, today, upcoming, pending, rejected) plus
 * notifications, so every dashboard, report and empty/populated state can be
 * exercised against real data.
 *
 * SAFETY: refuses to run when NODE_ENV=production (risk R12 — a seed script
 * pointed at production is a project-ending accident).
 *
 *   node src/seeds/index.js         # seed (wipes the demo collections first)
 *   node src/seeds/index.js --keep  # seed without wiping
 */
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Room } from '../models/Room.model.js';
import { Booking } from '../models/Booking.model.js';
import { Notification } from '../models/Notification.model.js';
import { AuditLog } from '../models/AuditLog.model.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { ROLES } from '../constants/roles.js';
import { ROOM_CATEGORIES, ROOM_STATUS } from '../constants/roomCategories.js';
import { FACILITIES } from '../constants/facilities.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';

if (env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.error('❌ Refusing to seed a production database.');
  process.exit(1);
}

const DAY = 86400000;
const PASSWORD = 'Passw0rd!23'; // meets the policy: upper, lower, digit, symbol

const utcDay = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const USERS = [
  { name: 'Aditi Rao', email: 'admin@roomflow.dev', role: ROLES.ADMIN, identifier: 'EMP-1001', department: 'Administration' },
  { name: 'Dr. Anil Kulkarni', email: 'staff@roomflow.dev', role: ROLES.STAFF, identifier: 'EMP-2043', department: 'Computer Engineering' },
  { name: 'Priya Menon', email: 'priya@roomflow.dev', role: ROLES.STAFF, identifier: 'EMP-2088', department: 'Library Services' },
  { name: 'Rahul Shah', email: 'student@roomflow.dev', role: ROLES.STUDENT, identifier: '2310055', department: 'Computer Engineering' },
  { name: 'Sara Iyer', email: 'sara@roomflow.dev', role: ROLES.STUDENT, identifier: '2310061', department: 'Electronics' },
  { name: 'Vikram Desai', email: 'vikram@roomflow.dev', role: ROLES.STUDENT, identifier: '2310074', department: 'Mechanical' },
  { name: 'Neha Gupta', email: 'neha@roomflow.dev', role: ROLES.STUDENT, identifier: '2310090', department: 'Computer Engineering' },
];

const ROOMS = [
  { code: 'SEM-HALL-A', name: 'Seminar Hall A', category: ROOM_CATEGORIES.SEMINAR_HALL, capacity: 120, building: 'Main Block', floor: 1, facilities: [FACILITIES.PROJECTOR, FACILITIES.AC, FACILITIES.AUDIO_SYSTEM, FACILITIES.WIFI], description: 'Tiered seminar hall with full AV and stage lighting.' },
  { code: 'CS-LAB-01', name: 'Computer Lab 01', category: ROOM_CATEGORIES.LAB, capacity: 60, building: 'CS Block', floor: 2, facilities: [FACILITIES.PROJECTOR, FACILITIES.AC, FACILITIES.WIFI, FACILITIES.POWER_OUTLETS], description: '60 workstations, dual-boot, gigabit network.' },
  { code: 'CONF-3F', name: 'Conference Room 3F', category: ROOM_CATEGORIES.CONFERENCE_ROOM, capacity: 24, building: 'Admin Block', floor: 3, facilities: [FACILITIES.VIDEO_CONFERENCING, FACILITIES.AC, FACILITIES.SMART_BOARD, FACILITIES.WIFI], description: 'Executive conference room with video conferencing.' },
  { code: 'AUD-MAIN', name: 'Main Auditorium', category: ROOM_CATEGORIES.AUDITORIUM, capacity: 500, building: 'Main Block', floor: 0, facilities: [FACILITIES.PROJECTOR, FACILITIES.AUDIO_SYSTEM, FACILITIES.AC, FACILITIES.ACCESSIBLE], description: 'Flagship 500-seat auditorium for convocations and events.' },
  { code: 'LIB-POD-07', name: 'Library Study Pod 7', category: ROOM_CATEGORIES.LIBRARY_STUDY_ROOM, capacity: 8, building: 'Library', floor: 2, facilities: [FACILITIES.WIFI, FACILITIES.WHITEBOARD, FACILITIES.POWER_OUTLETS], description: 'Quiet group study pod with whiteboard.' },
  { code: 'CLS-201', name: 'Classroom 201', category: ROOM_CATEGORIES.CLASSROOM, capacity: 70, building: 'Academic Block', floor: 2, facilities: [FACILITIES.PROJECTOR, FACILITIES.WHITEBOARD, FACILITIES.WIFI], description: 'Standard lecture room with projector.' },
  { code: 'CLS-305', name: 'Classroom 305', category: ROOM_CATEGORIES.CLASSROOM, capacity: 70, building: 'Academic Block', floor: 3, facilities: [FACILITIES.WHITEBOARD, FACILITIES.WIFI], description: 'Lecture room, north wing.' },
  { code: 'POD-MEET-2', name: 'Meeting Pod 2', category: ROOM_CATEGORIES.MEETING_POD, capacity: 6, building: 'CS Block', floor: 1, facilities: [FACILITIES.WIFI, FACILITIES.SMART_BOARD], description: 'Small huddle space for stand-ups.' },
  { code: 'EE-LAB-03', name: 'Electronics Lab 03', category: ROOM_CATEGORIES.LAB, capacity: 40, building: 'EE Block', floor: 1, facilities: [FACILITIES.POWER_OUTLETS, FACILITIES.AC, FACILITIES.WIFI], description: 'Embedded systems and instrumentation lab.' },
  { code: 'CONF-1F', name: 'Conference Room 1F', category: ROOM_CATEGORIES.CONFERENCE_ROOM, capacity: 16, building: 'Admin Block', floor: 1, facilities: [FACILITIES.AC, FACILITIES.WIFI, FACILITIES.WHITEBOARD], status: ROOM_STATUS.MAINTENANCE, description: 'Under refurbishment until next month.' },
];

const PURPOSES = [
  'Departmental review meeting with the project guides',
  'Final year project demonstration and evaluation',
  'Guest lecture on distributed systems architecture',
  'Placement preparation and mock interview session',
  'Group study session for the upcoming semester exams',
  'Technical club workshop on cloud deployment',
  'Faculty coordination meeting for the semester plan',
  'Student council planning session for the annual fest',
];

/** Deterministic pseudo-random so re-seeds look stable. */
let s = 42;
const rnd = () => {
  s = (s * 1103515245 + 12345) % 2147483648;
  return s / 2147483648;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

async function run() {
  const keep = process.argv.includes('--keep');
  await connectDB();
  logger.info(`Seeding ${mongoose.connection.name} …`);

  if (!keep) {
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Notification.deleteMany({}),
      RefreshToken.deleteMany({}),
      // AuditLog blocks deletes through Mongoose by design (§18.5 immutability),
      // so the seeder resets it through the native driver instead.
      AuditLog.collection.deleteMany({}),
    ]);
    logger.info('Cleared existing collections');
  }

  // --- Users (password hashed by the model pre-save hook) ---
  const users = [];
  for (const u of USERS) {
    // eslint-disable-next-line no-await-in-loop
    const doc = await User.create({
      ...u,
      password: PASSWORD,
      isVerified: true,
      phone: '9876500000'.slice(0, 6) + String(1000 + users.length),
      lastLoginAt: new Date(Date.now() - Math.floor(rnd() * 5) * DAY),
    });
    users.push(doc);
  }
  const admin = users[0];
  const staff = users.filter((u) => u.role === ROLES.STAFF);
  const students = users.filter((u) => u.role === ROLES.STUDENT);
  logger.info(`Created ${users.length} users`);

  // --- Rooms ---
  const rooms = await Room.create(
    ROOMS.map((r) => ({
      ...r,
      status: r.status || ROOM_STATUS.ACTIVE,
      operatingHours: { open: '08:00', close: '20:00', days: [1, 2, 3, 4, 5, 6] },
      createdBy: admin._id,
      requiresApproval: true,
    }))
  );
  const bookable = rooms.filter((r) => r.status === ROOM_STATUS.ACTIVE);
  logger.info(`Created ${rooms.length} rooms`);

  // --- Bookings across the last 21 days and the next 14 ---
  const bookings = [];
  let seq = 0;
  const nextRef = (date) => {
    seq += 1;
    const ym = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    return `RF-${ym}-${String(seq).padStart(4, '0')}`;
  };

  const makeBooking = (offsetDays, startHour, durationHrs, status, user, room) => {
    const bookingDate = utcDay(offsetDays);
    const startTime = `${String(startHour).padStart(2, '0')}:00`;
    const endTime = `${String(startHour + durationHrs).padStart(2, '0')}:00`;
    const startsAt = new Date(bookingDate.getTime() + startHour * 3600000);
    const endsAt = new Date(bookingDate.getTime() + (startHour + durationHrs) * 3600000);
    return {
      bookingRef: nextRef(bookingDate),
      room: room._id,
      user: user._id,
      roomCode: room.code,
      roomName: room.name,
      userName: user.name,
      bookingDate,
      startTime,
      endTime,
      startsAt,
      endsAt,
      durationMinutes: durationHrs * 60,
      purpose: pick(PURPOSES),
      attendees: Math.max(2, Math.floor(room.capacity * (0.25 + rnd() * 0.5))),
      status,
      approvedBy: status === BOOKING_STATUS.APPROVED || status === BOOKING_STATUS.COMPLETED ? admin._id : null,
      approvedAt: status === BOOKING_STATUS.APPROVED || status === BOOKING_STATUS.COMPLETED ? new Date(startsAt.getTime() - DAY) : null,
      rejectionReason: status === BOOKING_STATUS.REJECTED ? 'Room already allocated to a scheduled examination.' : null,
      cancellationReason: status === BOOKING_STATUS.CANCELLED ? 'Session postponed by the organiser.' : null,
      cancelledAt: status === BOOKING_STATUS.CANCELLED ? new Date(startsAt.getTime() - 2 * 3600000) : null,
      statusHistory: [{ status, changedBy: user._id, changedAt: new Date(startsAt.getTime() - DAY), reason: 'Seeded' }],
      reminderSent: status === BOOKING_STATUS.COMPLETED,
      createdAt: new Date(startsAt.getTime() - 2 * DAY),
    };
  };

  // Past — completed (drives utilisation + reports)
  for (let d = -21; d <= -1; d += 1) {
    const perDay = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < perDay; i += 1) {
      const hour = 9 + Math.floor(rnd() * 8);
      bookings.push(makeBooking(d, hour, 1 + Math.floor(rnd() * 2), BOOKING_STATUS.COMPLETED, pick([...students, ...staff]), pick(bookable)));
    }
  }
  // A few historical rejections / cancellations
  bookings.push(makeBooking(-6, 14, 2, BOOKING_STATUS.REJECTED, students[1], bookable[0]));
  bookings.push(makeBooking(-4, 11, 1, BOOKING_STATUS.CANCELLED, students[2], bookable[4]));
  bookings.push(makeBooking(-9, 16, 1, BOOKING_STATUS.REJECTED, students[0], bookable[3]));

  // Today — approved (drives "active today")
  bookings.push(makeBooking(0, 9, 2, BOOKING_STATUS.APPROVED, staff[0], bookable[1]));
  bookings.push(makeBooking(0, 11, 1, BOOKING_STATUS.APPROVED, students[0], bookable[4]));
  bookings.push(makeBooking(0, 14, 3, BOOKING_STATUS.APPROVED, staff[1], bookable[0]));
  bookings.push(makeBooking(0, 16, 1, BOOKING_STATUS.APPROVED, students[3], bookable[7]));

  // Upcoming — approved
  for (let d = 1; d <= 10; d += 1) {
    const perDay = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < perDay; i += 1) {
      const hour = 9 + Math.floor(rnd() * 8);
      bookings.push(makeBooking(d, hour, 1 + Math.floor(rnd() * 2), BOOKING_STATUS.APPROVED, pick([...students, ...staff]), pick(bookable)));
    }
  }

  // Pending — the approval queue
  bookings.push(makeBooking(1, 10, 2, BOOKING_STATUS.PENDING, students[0], bookable[0]));
  bookings.push(makeBooking(2, 13, 1, BOOKING_STATUS.PENDING, students[1], bookable[2]));
  bookings.push(makeBooking(3, 15, 2, BOOKING_STATUS.PENDING, students[2], bookable[5]));
  bookings.push(makeBooking(4, 9, 1, BOOKING_STATUS.PENDING, students[3], bookable[4]));
  bookings.push(makeBooking(5, 11, 3, BOOKING_STATUS.PENDING, staff[0], bookable[3]));

  await Booking.insertMany(bookings, { ordered: false });
  logger.info(`Created ${bookings.length} bookings`);

  // --- Notifications for the demo student ---
  const demoStudent = students[0];
  const recent = bookings.filter((b) => String(b.user) === String(demoStudent._id)).slice(-6);
  const notifs = recent.map((b, i) => ({
    recipient: demoStudent._id,
    type:
      b.status === BOOKING_STATUS.APPROVED
        ? NOTIFICATION_TYPES.BOOKING_APPROVED
        : b.status === BOOKING_STATUS.REJECTED
          ? NOTIFICATION_TYPES.BOOKING_REJECTED
          : NOTIFICATION_TYPES.BOOKING_CREATED,
    title:
      b.status === BOOKING_STATUS.APPROVED
        ? 'Booking approved'
        : b.status === BOOKING_STATUS.REJECTED
          ? 'Booking rejected'
          : 'Booking request received',
    message: `${b.bookingRef} · ${b.roomName} on ${b.bookingDate.toISOString().slice(0, 10)} at ${b.startTime}`,
    relatedBooking: null,
    link: '/bookings/me',
    isRead: i > 2,
  }));
  if (notifs.length) await Notification.insertMany(notifs);
  logger.info(`Created ${notifs.length} notifications`);

  // --- Audit trail sample ---
  await AuditLog.insertMany(
    rooms.slice(0, 5).map((r) => ({
      actor: admin._id,
      actorRole: admin.role,
      actorName: admin.name,
      action: 'ROOM_CREATED',
      entityType: 'Room',
      entityId: r._id,
      after: { code: r.code },
      status: 'success',
      ipAddress: '127.0.0.1',
    }))
  );

  logger.info('✅ Seed complete');
  // eslint-disable-next-line no-console
  console.log(`
  Demo accounts (password: ${PASSWORD})
    admin@roomflow.dev    → Admin
    staff@roomflow.dev    → Staff / Faculty
    student@roomflow.dev  → Student
  `);

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  logger.error('Seed failed', { message: err.message, stack: err.stack });
  await disconnectDB().catch(() => {});
  process.exit(1);
});
