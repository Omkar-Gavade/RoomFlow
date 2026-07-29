/**
 * Reusable Zod building blocks — ARCHITECTURE.md §17.2.3, §19.4.
 *
 * Shared schemas that every module composes (pagination, ObjectId, date range,
 * HH:mm time). Module-specific schemas (auth/room/booking) arrive with their
 * modules and import from here — DRY validation.
 */
import { z } from 'zod';

/** 24-char hex MongoDB ObjectId. */
export const objectId = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

/** HH:mm 24-hour time string (§7.4). */
export const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:mm');

/** List pagination — page ≥ 1, limit 1..100 (default 10) (§19.4). */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  search: z.string().trim().optional(),
});

/** Date range — from ≤ to, span ≤ 366 days (§19.4). */
export const dateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((v) => v.from <= v.to, { message: 'from must be on or before to', path: ['from'] })
  .refine((v) => (v.to - v.from) / 86400000 <= 366, {
    message: 'Date range cannot exceed 366 days',
    path: ['to'],
  });

/** Params schema for any `:id` route. */
export const idParamSchema = z.object({ id: objectId });

export default { objectId, timeString, paginationSchema, dateRangeSchema, idParamSchema };
