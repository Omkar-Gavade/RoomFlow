/**
 * Booking Zod schemas — ARCHITECTURE.md §17.2.3, §19.3, §10.4.
 * Strict write bodies; time format + end>start enforced early (model re-checks).
 */
import { z } from 'zod';

import { BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';
import { FACILITY_VALUES } from '../constants/facilities.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const time = z.string().regex(TIME_RE, 'Time must be HH:mm');
const bookingDate = z.coerce.date();
const purpose = z.string().trim().min(10, 'Purpose must be at least 10 characters').max(500);
const attendees = z.coerce.number().int().min(1);

const endAfterStart = (d) => d.endTime > d.startTime;

export const idParamSchema = z.object({ id: objectId });

export const createBookingSchema = z
  .object({
    room: objectId,
    bookingDate,
    startTime: time,
    endTime: time,
    purpose,
    attendees,
  })
  .strict()
  .refine(endAfterStart, { message: 'endTime must be after startTime', path: ['endTime'] });

export const rescheduleSchema = z
  .object({ bookingDate, startTime: time, endTime: time })
  .strict()
  .refine(endAfterStart, { message: 'endTime must be after startTime', path: ['endTime'] });

export const approveSchema = z.object({ remark: z.string().trim().max(300).optional() }).strict();

export const rejectSchema = z
  .object({ reason: z.string().trim().min(10, 'Reason is required (min 10 chars)').max(300) })
  .strict();

export const cancelSchema = z.object({ reason: z.string().trim().max(300).optional() }).strict();

export const checkConflictSchema = z
  .object({
    room: objectId,
    bookingDate,
    startTime: time,
    endTime: time,
    excludeId: objectId.optional(),
  })
  .strict()
  .refine(endAfterStart, { message: 'endTime must be after startTime', path: ['endTime'] });

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  status: z.enum(BOOKING_STATUS_VALUES).optional(),
  room: objectId.optional(),
  user: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const calendarQuerySchema = z.object({
  view: z.enum(['month', 'week', 'day']).optional(),
  date: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  room: objectId.optional(),
});

/** GET /rooms/:id/availability?date= */
export const availabilityQuerySchema = z.object({ date: z.coerce.date() });

/** GET /rooms/available?date&startTime&endTime&capacity&facilities */
export const availableRoomsQuerySchema = z
  .object({
    date: z.coerce.date(),
    startTime: time,
    endTime: time,
    capacity: z.coerce.number().int().min(1).optional(),
    facilities: z
      .string()
      .optional()
      .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))
      .refine((arr) => !arr || arr.every((f) => FACILITY_VALUES.includes(f)), 'Invalid facility'),
  })
  .refine(endAfterStart, { message: 'endTime must be after startTime', path: ['endTime'] });

export default {
  idParamSchema,
  createBookingSchema,
  rescheduleSchema,
  approveSchema,
  rejectSchema,
  cancelSchema,
  checkConflictSchema,
  listBookingsQuerySchema,
  calendarQuerySchema,
  availabilityQuerySchema,
  availableRoomsQuerySchema,
};
