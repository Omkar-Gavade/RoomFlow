/**
 * Room Zod schemas — ARCHITECTURE.md §17.2.3, §19.2, §10.3.
 *
 * List query (search/filter/sort/paginate) + admin write bodies. `.strict()`
 * strips unknown keys. Facilities in the query arrive comma-separated and are
 * transformed to a validated array. Images/facilities/hours have dedicated
 * endpoints, so they are not part of the create/PUT bodies.
 */
import { z } from 'zod';

import { ROOM_CATEGORY_VALUES, ROOM_STATUS_VALUES } from '../constants/roomCategories.js';
import { FACILITY_VALUES } from '../constants/facilities.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{3,20}$/, 'Code must be 3–20 chars: A–Z, 0–9, hyphen');
const name = z.string().trim().min(3).max(100);
const category = z.enum(ROOM_CATEGORY_VALUES);
const capacity = z.coerce.number().int().min(1).max(1000);
const building = z.string().trim().min(2).max(100);
const floor = z.coerce.number().int().min(0).max(50);
const description = z.string().trim().max(1000);
const facilitiesArray = z.array(z.enum(FACILITY_VALUES)).refine(
  (arr) => new Set(arr).size === arr.length,
  'Duplicate facilities are not allowed'
);

export const operatingHoursSchema = z
  .object({
    open: z.string().regex(TIME_RE, 'open must be HH:mm'),
    close: z.string().regex(TIME_RE, 'close must be HH:mm'),
    days: z.array(z.number().int().min(0).max(6)).min(1, 'At least one operating day'),
  })
  .strict()
  .refine((v) => v.close > v.open, { message: 'close must be after open', path: ['close'] });

export const idParamSchema = z.object({ id: objectId });
export const imageParamSchema = z.object({ id: objectId, imageId: objectId });

/** Admin list (§10.3) — all filters optional. */
export const listRoomsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  category: category.optional(),
  building: z.string().trim().max(100).optional(),
  floor: floor.optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
  maxCapacity: z.coerce.number().int().min(1).optional(),
  status: z.enum(ROOM_STATUS_VALUES).optional(),
  facilities: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined))
    .refine((arr) => !arr || arr.every((f) => FACILITY_VALUES.includes(f)), 'Invalid facility'),
});

export const createRoomSchema = z
  .object({
    code,
    name,
    category,
    capacity,
    building,
    floor: floor.optional(),
    description: description.optional(),
    facilities: facilitiesArray.optional(),
    operatingHours: operatingHoursSchema.optional(),
    requiresApproval: z.boolean().optional(),
    guestBookable: z.boolean().optional(),
    pricePerHour: z.coerce.number().min(0).optional(),
  })
  .strict();

export const updateRoomSchema = z
  .object({
    code,
    name,
    category,
    capacity,
    building,
    floor: floor.optional(),
    description: description.optional(),
    requiresApproval: z.boolean().optional(),
    guestBookable: z.boolean().optional(),
    pricePerHour: z.coerce.number().min(0).optional(),
  })
  .strict();

export const statusSchema = z.object({ status: z.enum(ROOM_STATUS_VALUES) }).strict();
export const facilitiesSchema = z.object({ facilities: facilitiesArray }).strict();

export default {
  idParamSchema,
  imageParamSchema,
  listRoomsQuerySchema,
  createRoomSchema,
  updateRoomSchema,
  statusSchema,
  facilitiesSchema,
  operatingHoursSchema,
};
