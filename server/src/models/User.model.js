/**
 * User model — ARCHITECTURE.md §18.1, §7.3, §8.
 *
 * Identity, role, and profile. DATABASE LAYER ONLY:
 *   - password is defined with select:false + private:true, but is NOT hashed
 *     here — bcrypt hashing and auth methods (comparePassword, reset tokens)
 *     belong to the Phase 1B auth service, not the model.
 *   - `role` is stored data; the permission policy lives elsewhere (§11.5).
 * Soft-delete via plugin (§18.1). Indexes per §7.3.
 */
import crypto from 'node:crypto';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { ROLE_VALUES, ROLES } from '../constants/roles.js';
import { env } from '../config/env.js';
import { softDeletePlugin } from './plugins/softDelete.plugin.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const avatarSchema = new Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      private: true,
    },
    role: {
      type: String,
      enum: { values: ROLE_VALUES, message: 'Invalid role: {VALUE}' },
      default: ROLES.STUDENT,
    },
    // Pending role upgrade awaiting admin approval (§18.1, FR-AUTH-10).
    roleRequest: {
      type: String,
      enum: { values: ROLE_VALUES, message: 'Invalid role request: {VALUE}' },
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits'],
    },
    department: { type: String, trim: true, maxlength: 100 },
    // Roll no. / employee ID — unique but optional (sparse).
    identifier: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: 20,
    },
    avatar: { type: avatarSchema, default: undefined },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    // Auth fields — populated by the auth service later; never exposed.
    resetPasswordToken: { type: String, select: false, private: true, default: null },
    resetPasswordExpires: { type: Date, select: false, private: true, default: null },
    // Email verification (§11.2, FR-AUTH register isVerified false).
    emailVerificationToken: { type: String, select: false, private: true, default: null },
    emailVerificationExpires: { type: Date, select: false, private: true, default: null },
    // Set when the password changes — used to invalidate older access tokens (§11.3).
    passwordChangedAt: { type: Date, default: null },
    // Brute-force lockout (§23 #4).
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.plugin(softDeletePlugin);
userSchema.plugin(toJSONPlugin);

// --- Indexes (§7.3) ---
userSchema.index({ role: 1, isBlocked: 1 }); // admin user-list filters
userSchema.index({ name: 'text', email: 'text' }); // user search

// --- Virtuals (§18.1) ---
userSchema.virtual('bookingCount', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user',
  count: true,
});

/** True while a temporary brute-force lock is active. */
userSchema.virtual('isLocked').get(function isLocked() {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// --- Auth hooks & methods (Phase 1B) ---

/** Hash the password with bcrypt whenever it is set/changed (§23 #1). */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
  // Backdate 1s so a token minted in the same second is still considered older.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  return next();
});

/** Constant-time password comparison. Requires the doc loaded with +password. */
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/** True if the password changed after the given JWT `iat` (seconds). */
userSchema.methods.passwordChangedAfter = function passwordChangedAfter(iatSeconds) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > iatSeconds;
};

/** Create a single-use password-reset token; stores the HASH, returns the RAW. */
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + env.RESET_TOKEN_EXPIRY_MIN * 60 * 1000);
  return raw;
};

/** Create an email-verification token; stores the HASH, returns the RAW. */
userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(raw).digest('hex');
  this.emailVerificationExpires = new Date(
    Date.now() + env.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000
  );
  return raw;
};

export const User = model('User', userSchema);
export default User;
