/**
 * User-management Zod schemas — ARCHITECTURE.md §17.2.3, §19.1, §19.4.
 *
 * Covers admin CRUD + self-profile + list query (search/filter/sort/paginate).
 * `.strict()` on write bodies strips unknown keys (mass-assignment defence,
 * §23 #8) — a client cannot smuggle `isBlocked`, `isDeleted`, or `role` into a
 * profile update. Role changes go through their own dedicated endpoint.
 */
import { z } from 'zod';

import { ROLE_VALUES } from '../constants/roles.js';

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/\d/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const email = z.string().trim().toLowerCase().email('Please provide a valid email');
const name = z.string().trim().min(3, 'Name must be at least 3 characters').max(50);
const phone = z.string().regex(/^\d{10}$/, 'Phone must be 10 digits');
const department = z.string().trim().max(100);
const identifier = z.string().trim().min(3).max(20);

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid user id'),
});

/** Admin list: search + filter + sort + paginate (§10.8, §19.4). */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  role: z.enum(ROLE_VALUES).optional(),
  department: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'blocked', 'verified', 'unverified', 'deleted']).optional(),
});

/** Admin create (§10.8 POST /users). Admin may set any role; account trusted → verified. */
export const createUserSchema = z
  .object({
    name,
    email,
    password: strongPassword,
    role: z.enum(ROLE_VALUES),
    identifier: identifier.optional(),
    department: department.optional(),
    phone: phone.optional(),
  })
  .strict();

/** Admin full profile replace (PUT). Role/email/password handled separately. */
export const updateUserSchema = z
  .object({
    name,
    phone: phone.optional(),
    department: department.optional(),
    identifier: identifier.optional(),
  })
  .strict();

/** Self profile update (PATCH /users/me) — partial. */
export const updateProfileSchema = z
  .object({
    name: name.optional(),
    phone: phone.optional(),
    department: department.optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

/** Admin change role (§10.8 PATCH /users/:id/role). */
export const changeRoleSchema = z.object({ role: z.enum(ROLE_VALUES) }).strict();

/** Admin block / deactivate — optional reason (§18.1 blockReason). */
export const blockUserSchema = z
  .object({ reason: z.string().trim().max(300).optional() })
  .strict();

export default {
  idParamSchema,
  listUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changeRoleSchema,
  blockUserSchema,
};
