/**
 * Notification Zod schemas — ARCHITECTURE.md §10.7, §17.2.3.
 */
import { z } from 'zod';

import { NOTIFICATION_TYPE_VALUES, NOTIFICATION_PRIORITY_VALUES } from '../constants/notificationTypes.js';
import { ROLE_VALUES } from '../constants/roles.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const idParamSchema = z.object({ id: objectId });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  type: z.enum(NOTIFICATION_TYPE_VALUES).optional(),
});

export const broadcastSchema = z
  .object({
    role: z.enum([...ROLE_VALUES, 'all']).default('all'),
    title: z.string().trim().min(3).max(120),
    message: z.string().trim().min(3).max(500),
    priority: z.enum(NOTIFICATION_PRIORITY_VALUES).optional(),
  })
  .strict();

export const preferencesSchema = z
  .object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'No preferences provided' });

export default { idParamSchema, listQuerySchema, broadcastSchema, preferencesSchema };
