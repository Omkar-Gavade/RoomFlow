/**
 * Settings Zod schemas — ARCHITECTURE.md §10.9, §19.
 * Profile/password reuse the existing user/auth schemas via the controller.
 */
import { z } from 'zod';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const workingHours = z
  .object({
    open: z.string().regex(TIME_RE, 'open must be HH:mm'),
    close: z.string().regex(TIME_RE, 'close must be HH:mm'),
    days: z.array(z.number().int().min(0).max(6)).min(1),
  })
  .refine((v) => v.close > v.open, { message: 'close must be after open', path: ['close'] });

export const systemConfigSchema = z
  .object({
    institutionName: z.string().trim().min(2).max(120).optional(),
    workingHours: workingHours.optional(),
    minBookingDurationMinutes: z.coerce.number().int().min(5).optional(),
    maxBookingDurationMinutes: z.coerce.number().int().min(15).optional(),
    maxAdvanceBookingDays: z.coerce.number().int().min(1).optional(),
    maxActiveBookingsPerUser: z.coerce.number().int().min(1).optional(),
    autoApproveStaff: z.boolean().optional(),
    reminderLeadMinutes: z.coerce.number().int().min(5).optional(),
    maintenanceMode: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export const bookingRulesSchema = z
  .object({
    minBookingDurationMinutes: z.coerce.number().int().min(5).optional(),
    maxBookingDurationMinutes: z.coerce.number().int().min(15).optional(),
    maxAdvanceBookingDays: z.coerce.number().int().min(1).optional(),
    maxActiveBookingsPerUser: z.coerce.number().int().min(1).optional(),
    autoApproveStaff: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'No rules to update' })
  .refine(
    (d) =>
      d.minBookingDurationMinutes === undefined ||
      d.maxBookingDurationMinutes === undefined ||
      d.minBookingDurationMinutes <= d.maxBookingDurationMinutes,
    { message: 'min duration must be ≤ max duration', path: ['minBookingDurationMinutes'] }
  );

export const holidaySchema = z
  .object({ date: z.coerce.date(), name: z.string().trim().max(100).optional() })
  .strict();

export const holidayIdParamSchema = z.object({ id: objectId });

export default { systemConfigSchema, bookingRulesSchema, holidaySchema, holidayIdParamSchema };
