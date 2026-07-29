/**
 * Auth Zod schemas — ARCHITECTURE.md §19.1, ADR-11.
 *
 * Strong-password policy, self-registration role restriction (admin never
 * self-assignable), and confirm-password matching. `.strict()` strips unknown
 * keys so a client cannot smuggle fields like `role: 'admin'` or `isBlocked`
 * (mass-assignment defence, §23 #8).
 */
import { z } from 'zod';

import { ROLES } from '../constants/roles.js';

// A tiny blocklist of the most common passwords (§23.2). Extend as needed.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', '12345678', '123456789', 'qwerty123', 'admin123', 'welcome1',
]);

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/\d/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character')
  .refine((p) => !COMMON_PASSWORDS.has(p.toLowerCase()), 'Password is too common');

const email = z.string().trim().toLowerCase().email('Please provide a valid email');

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').max(50),
    email,
    password: strongPassword,
    confirmPassword: z.string(),
    // Self-registration allows only student/staff — admin is never self-assignable (§19.1).
    role: z.enum([ROLES.STUDENT, ROLES.STAFF]).default(ROLES.STUDENT),
    identifier: z.string().trim().min(3).max(20).optional(),
    department: z.string().trim().max(100).optional(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  })
  .strict()
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordParamsSchema = z.object({ token: z.string().min(10) });

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .strict()
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'New password must differ from the current password',
    path: ['newPassword'],
  });

export const verifyEmailParamsSchema = z.object({ token: z.string().min(10) });

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordParamsSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailParamsSchema,
};
