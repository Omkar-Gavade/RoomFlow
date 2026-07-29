/**
 * Report Zod schemas — ARCHITECTURE.md §10.6, §19.4.
 */
import { z } from 'zod';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const range = {
  from: z.coerce.date(),
  to: z.coerce.date(),
};
const rangeRefine = (d) => d.from <= d.to;

export const dailyQuerySchema = z.object({ date: z.coerce.date().default(() => new Date()) });
export const weeklyQuerySchema = z.object({ weekStart: z.coerce.date() });
export const monthlyQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM'),
});

export const rangeQuerySchema = z.object(range).refine(rangeRefine, { message: 'from must be on or before to', path: ['from'] });

export const utilizationQuerySchema = z
  .object({ ...range, roomId: objectId.optional(), groupBy: z.enum(['room', 'category', 'building']).default('room') })
  .refine(rangeRefine, { message: 'from must be on or before to', path: ['from'] });

export const mostBookedQuerySchema = z
  .object({ ...range, limit: z.coerce.number().int().min(1).max(50).default(10) })
  .refine(rangeRefine, { message: 'from must be on or before to', path: ['from'] });

export const exportQuerySchema = z
  .object({
    type: z.enum(['utilization', 'most-booked', 'user-activity', 'peak-hours']),
    format: z.enum(['csv']).default('csv'),
    ...range,
    roomId: objectId.optional(),
    groupBy: z.enum(['room', 'category', 'building']).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .refine(rangeRefine, { message: 'from must be on or before to', path: ['from'] });

export default {
  dailyQuerySchema,
  weeklyQuerySchema,
  monthlyQuerySchema,
  rangeQuerySchema,
  utilizationQuerySchema,
  mostBookedQuerySchema,
  exportQuerySchema,
};
