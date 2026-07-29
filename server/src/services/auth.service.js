/**
 * Auth service — ARCHITECTURE.md §11, §16 (fat service, thin controller), §23.
 *
 * ALL authentication business logic lives here. Controllers only adapt HTTP.
 * Every auth event is recorded through the audit service. Emails are best-effort
 * (never block the flow). Generic error messages avoid user enumeration (§23 #4).
 */
import { User } from '../models/User.model.js';
import * as tokenService from './token.service.js';
import * as auditService from './audit.service.js';
import { sendEmail } from './email.service.js';
import { hashToken } from '../utils/crypto.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';
import { ROLES } from '../constants/roles.js';
import { permissionsForRole } from '../constants/permissions.js';

const clientBase = () => env.corsOrigins[0] || env.CLIENT_URL;

/** Thin wrapper so every call site records a consistent audit shape. */
function audit(action, { actor = null, user = null, entityId, status = 'success', ctx = {} }) {
  return auditService.record({
    actor: actor || user?._id || null,
    actorRole: user?.role,
    actorName: user?.name,
    action,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: entityId || user?._id || null,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    status,
    metadata: { requestId: ctx.requestId },
  });
}

const sessionMeta = (ctx) => ({
  ipAddress: ctx.ipAddress,
  userAgent: ctx.userAgent,
  deviceInfo: ctx.userAgent,
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export async function register(dto, ctx = {}) {
  const existing = await User.findOne({ email: dto.email }).setOptions({ withDeleted: true });
  if (existing) throw ApiError.conflict('Email already registered', 'EMAIL_ALREADY_EXISTS');

  if (dto.identifier) {
    const dup = await User.findOne({ identifier: dto.identifier });
    if (dup) throw ApiError.conflict('ID already registered', 'IDENTIFIER_EXISTS');
  }

  // Self-registration: staff requests are pending admin approval (FR-AUTH-10).
  const roleRequest = dto.role === ROLES.STAFF ? ROLES.STAFF : null;

  const user = new User({
    name: dto.name,
    email: dto.email,
    password: dto.password,
    role: ROLES.STUDENT,
    roleRequest,
    identifier: dto.identifier,
    department: dto.department,
    phone: dto.phone,
  });

  const rawVerify = user.createEmailVerificationToken();
  await user.save();

  // Best-effort verification email.
  sendEmail({
    to: user.email,
    subject: 'Verify your RoomFlow account',
    html: `<p>Hi ${user.name},</p><p>Verify your email:</p>
           <p><a href="${clientBase()}/verify-email/${rawVerify}">Verify Email</a></p>
           <p>This link expires in ${env.EMAIL_VERIFICATION_EXPIRY_HOURS} hours.</p>`,
  }).catch((e) => logger.warn('verify email send failed', { error: e.message }));

  await audit(AUDIT_ACTIONS.USER_REGISTERED, { user, ctx });
  return user;
}

// ---------------------------------------------------------------------------
// Login (with brute-force lockout)
// ---------------------------------------------------------------------------
export async function login(email, password, ctx = {}) {
  const user = await User.findOne({ email }).select('+password');

  // Generic failure — never reveal whether the email exists (§23 #4).
  const invalid = () => ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

  if (!user) {
    await audit(AUDIT_ACTIONS.USER_LOGIN_FAILED, { actor: null, status: 'failure', ctx });
    throw invalid();
  }
  if (user.isBlocked) throw ApiError.forbidden('Account is blocked', 'ACCOUNT_BLOCKED');
  if (user.isLocked) {
    throw ApiError.forbidden('Account temporarily locked. Try again later.', 'ACCOUNT_LOCKED');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + env.ACCOUNT_LOCK_MINUTES * 60 * 1000);
      user.loginAttempts = 0;
      await user.save();
      await audit(AUDIT_ACTIONS.ACCOUNT_LOCKED, { user, status: 'failure', ctx });
    } else {
      await user.save();
    }
    await audit(AUDIT_ACTIONS.USER_LOGIN_FAILED, { user, status: 'failure', ctx });
    throw invalid();
  }

  // Success — clear counters, stamp login.
  if (user.loginAttempts !== 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = null;
  }
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = tokenService.signAccessToken(user);
  const { raw: refreshToken } = await tokenService.createRefreshToken(user, sessionMeta(ctx));

  await audit(AUDIT_ACTIONS.USER_LOGIN, { user, ctx });
  user.password = undefined;
  return { user, accessToken, refreshToken };
}

// ---------------------------------------------------------------------------
// Refresh (rotation + reuse detection)
// ---------------------------------------------------------------------------
export async function refresh(rawToken, ctx = {}) {
  if (!rawToken) throw ApiError.unauthorized('No refresh token', 'NO_REFRESH_TOKEN');

  const doc = await tokenService.findRefreshByRaw(rawToken);
  if (!doc) throw ApiError.unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN');

  // Reuse detection: a revoked token presented again ⇒ theft ⇒ nuke the chain.
  if (doc.isRevoked) {
    await tokenService.revokeAllUserTokens(doc.user, 'reuse_detected');
    await audit(AUDIT_ACTIONS.TOKEN_REUSE_DETECTED, {
      actor: doc.user,
      entityId: doc.user,
      status: 'failure',
      ctx,
    });
    throw ApiError.unauthorized('Refresh token reuse detected', 'TOKEN_REUSE_DETECTED');
  }

  if (doc.expiresAt.getTime() < Date.now()) {
    await tokenService.revokeRefreshToken(doc, 'rotated');
    throw ApiError.unauthorized('Refresh token expired', 'TOKEN_EXPIRED');
  }

  const user = await User.findById(doc.user);
  if (!user || user.isDeleted || user.isBlocked) {
    await tokenService.revokeAllUserTokens(doc.user, 'blocked');
    throw ApiError.unauthorized('Account unavailable', 'ACCOUNT_UNAVAILABLE');
  }

  const { raw: refreshToken } = await tokenService.rotateRefreshToken(doc, user, sessionMeta(ctx));
  const accessToken = tokenService.signAccessToken(user);

  await audit(AUDIT_ACTIONS.TOKEN_REFRESHED, { user, ctx });
  return { user, accessToken, refreshToken };
}

// ---------------------------------------------------------------------------
// Logout / Logout-all
// ---------------------------------------------------------------------------
export async function logout(rawToken, ctx = {}) {
  if (!rawToken) return;
  const doc = await tokenService.findRefreshByRaw(rawToken);
  if (doc && !doc.isRevoked) {
    await tokenService.revokeRefreshToken(doc, 'logout');
    await audit(AUDIT_ACTIONS.USER_LOGOUT, { actor: doc.user, entityId: doc.user, ctx });
  }
}

export async function logoutAll(userId, ctx = {}) {
  await tokenService.revokeAllUserTokens(userId, 'logout_all');
  await audit(AUDIT_ACTIONS.USER_LOGOUT_ALL, { actor: userId, entityId: userId, ctx });
}

// ---------------------------------------------------------------------------
// Current user
// ---------------------------------------------------------------------------
export function getMe(user) {
  return { user, permissions: permissionsForRole(user.role) };
}

// ---------------------------------------------------------------------------
// Forgot / Reset password
// ---------------------------------------------------------------------------
export async function forgotPassword(email, ctx = {}) {
  const user = await User.findOne({ email });
  // Always return success — no enumeration.
  if (!user) return;

  const rawReset = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  sendEmail({
    to: user.email,
    subject: 'Reset your RoomFlow password',
    html: `<p>Hi ${user.name},</p><p>Reset your password:</p>
           <p><a href="${clientBase()}/reset-password/${rawReset}">Reset Password</a></p>
           <p>This link expires in ${env.RESET_TOKEN_EXPIRY_MIN} minutes. Ignore if you did not request it.</p>`,
  }).catch((e) => logger.warn('reset email send failed', { error: e.message }));

  await audit(AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED, { user, ctx });
}

export async function resetPassword(rawToken, newPassword, ctx = {}) {
  const user = await User.findOne({
    resetPasswordToken: hashToken(rawToken),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token', 'INVALID_OR_EXPIRED_TOKEN');

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Invalidate every existing session (§23.2).
  await tokenService.revokeAllUserTokens(user._id, 'password_changed');
  await audit(AUDIT_ACTIONS.PASSWORD_RESET, { user, ctx });
}

// ---------------------------------------------------------------------------
// Change password (authenticated)
// ---------------------------------------------------------------------------
export async function changePassword(userId, currentPassword, newPassword, ctx = {}) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.unauthorized('Current password is incorrect', 'INVALID_CREDENTIALS');

  user.password = newPassword;
  await user.save();

  // Revoke all sessions, then issue a fresh pair so the current session continues.
  await tokenService.revokeAllUserTokens(user._id, 'password_changed');
  const accessToken = tokenService.signAccessToken(user);
  const { raw: refreshToken } = await tokenService.createRefreshToken(user, sessionMeta(ctx));

  await audit(AUDIT_ACTIONS.PASSWORD_CHANGED, { user, ctx });
  user.password = undefined;
  return { user, accessToken, refreshToken };
}

// ---------------------------------------------------------------------------
// Verify email
// ---------------------------------------------------------------------------
export async function verifyEmail(rawToken, ctx = {}) {
  const user = await User.findOne({
    emailVerificationToken: hashToken(rawToken),
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest('Invalid or expired verification token', 'INVALID_OR_EXPIRED_TOKEN');

  user.isVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save({ validateBeforeSave: false });

  await audit(AUDIT_ACTIONS.EMAIL_VERIFIED, { user, ctx });
  return user;
}

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
};
