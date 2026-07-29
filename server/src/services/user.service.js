/**
 * User service — ARCHITECTURE.md §16 (fat service), §10.8, §11.5, §18.1, §23.
 *
 * ALL user-management business logic. Controllers stay thin. Every mutating
 * operation is recorded through the audit service. Self-action guards implement
 * FR-USER-04 (an admin cannot block / demote / delete their own account).
 * Reuses existing utilities: upload service (avatars), token service (session
 * revocation), soft-delete plugin, pagination helpers.
 */
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta, containsRegex, parseSort } from '../utils/pagination.js';
import { env } from '../config/env.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';

import { uploadImage, deleteImage } from './upload.service.js';
import * as auditService from './audit.service.js';
import * as tokenService from './token.service.js';

/** Fields returned by list/detail (password/reset already excluded via select:false). */
const PUBLIC_FIELDS =
  'name email role roleRequest department identifier isBlocked blockReason isVerified isDeleted avatar lastLoginAt createdAt updatedAt';

const SORTABLE = ['name', 'email', 'role', 'department', 'createdAt', 'lastLoginAt'];

// --- helpers ---------------------------------------------------------------

function audit(action, { actor, target, ctx = {}, before, after }) {
  return auditService.record({
    actor: actor?._id || null,
    actorRole: actor?.role,
    actorName: actor?.name,
    action,
    entityType: AUDIT_ENTITY_TYPES.USER,
    entityId: target?._id || target || null,
    before,
    after,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    status: 'success',
    metadata: { requestId: ctx.requestId },
  });
}

function assertNotSelf(actor, targetId, message) {
  if (String(actor._id) === String(targetId)) {
    throw ApiError.forbidden(message, 'SELF_ACTION_FORBIDDEN');
  }
}

async function findUserOr404(id, { withDeleted = false } = {}) {
  let q = User.findById(id);
  if (withDeleted) q = q.setOptions({ withDeleted: true });
  const user = await q;
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
}

// ===========================================================================
// SELF (owner = authenticated user)
// ===========================================================================

export function getMyProfile(user) {
  return user; // already loaded by authenticate
}

export async function updateMyProfile(userId, dto, ctx) {
  const user = await findUserOr404(userId);
  if (dto.name !== undefined) user.name = dto.name;
  if (dto.phone !== undefined) user.phone = dto.phone;
  if (dto.department !== undefined) user.department = dto.department;
  await user.save();
  await audit(AUDIT_ACTIONS.USER_PROFILE_UPDATED, { actor: user, target: user, ctx });
  return user;
}

export async function updateMyAvatar(userId, file, ctx) {
  if (!file || !file.buffer) throw ApiError.badRequest('No image uploaded', 'NO_FILE');
  const user = await findUserOr404(userId);

  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/avatars`,
  });

  // Replace: delete the previous asset best-effort.
  const oldPublicId = user.avatar?.publicId;
  user.avatar = { url, publicId };
  await user.save();
  if (oldPublicId) await deleteImage(oldPublicId).catch(() => {});

  await audit(AUDIT_ACTIONS.USER_AVATAR_UPDATED, { actor: user, target: user, ctx });
  return user;
}

export async function removeMyAvatar(userId, ctx) {
  const user = await findUserOr404(userId);
  const oldPublicId = user.avatar?.publicId;
  user.avatar = undefined;
  await user.save();
  if (oldPublicId) await deleteImage(oldPublicId).catch(() => {});
  await audit(AUDIT_ACTIONS.USER_AVATAR_REMOVED, { actor: user, target: user, ctx });
  return user;
}

export async function deleteMyAccount(userId, ctx) {
  const user = await findUserOr404(userId);
  await user.softDelete();
  await tokenService.revokeAllUserTokens(user._id, 'blocked');
  await audit(AUDIT_ACTIONS.USER_SELF_DELETED, { actor: user, target: user, ctx });
}

// ===========================================================================
// ADMIN
// ===========================================================================

export async function listUsers(query) {
  const { page, limit, skip } = getPagination(query);
  const sort = parseSort(query.sort, SORTABLE, { createdAt: -1 });

  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.department) filter.department = containsRegex(query.department);
  if (query.search) {
    const rx = containsRegex(query.search);
    filter.$or = [{ name: rx }, { email: rx }, { identifier: rx }];
  }

  // Status → existing schema fields (no isActive field exists — §18.1).
  let includeDeleted = false;
  switch (query.status) {
    case 'blocked':
      filter.isBlocked = true;
      filter.isDeleted = false;
      break;
    case 'verified':
      filter.isVerified = true;
      filter.isDeleted = false;
      break;
    case 'unverified':
      filter.isVerified = false;
      filter.isDeleted = false;
      break;
    case 'deleted':
      filter.isDeleted = true;
      includeDeleted = true;
      break;
    case 'active':
    default:
      filter.isBlocked = false;
      filter.isDeleted = false;
      break;
  }

  let findQ = User.find(filter).select(PUBLIC_FIELDS).sort(sort).skip(skip).limit(limit).lean();
  if (includeDeleted) findQ = findQ.setOptions({ withDeleted: true });

  const [users, total] = await Promise.all([findQ, User.countDocuments(filter)]);
  return { users, meta: buildMeta(total, page, limit) };
}

export async function getUserById(id) {
  const user = await User.findById(id)
    .select(PUBLIC_FIELDS)
    .setOptions({ withDeleted: true });
  if (!user) throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
  return user;
}

export async function createUser(dto, actor, ctx) {
  const existing = await User.findOne({ email: dto.email }).setOptions({ withDeleted: true });
  if (existing) throw ApiError.conflict('Email already registered', 'EMAIL_ALREADY_EXISTS');
  if (dto.identifier) {
    const dup = await User.findOne({ identifier: dto.identifier }).setOptions({ withDeleted: true });
    if (dup) throw ApiError.conflict('ID already registered', 'IDENTIFIER_EXISTS');
  }

  const user = await User.create({
    name: dto.name,
    email: dto.email,
    password: dto.password,
    role: dto.role,
    identifier: dto.identifier,
    department: dto.department,
    phone: dto.phone,
    isVerified: true, // admin-created accounts are trusted
  });

  await audit(AUDIT_ACTIONS.USER_CREATED, { actor, target: user, ctx, after: { role: user.role } });
  user.password = undefined;
  return user;
}

export async function updateUser(id, dto, actor, ctx) {
  const user = await findUserOr404(id);
  user.name = dto.name;
  if (dto.phone !== undefined) user.phone = dto.phone;
  if (dto.department !== undefined) user.department = dto.department;
  if (dto.identifier !== undefined) user.identifier = dto.identifier;
  await user.save();
  await audit(AUDIT_ACTIONS.USER_UPDATED, { actor, target: user, ctx });
  return user;
}

export async function deleteUser(id, actor, ctx) {
  assertNotSelf(actor, id, 'You cannot delete your own admin account');
  const user = await findUserOr404(id);
  await user.softDelete();
  await tokenService.revokeAllUserTokens(user._id, 'blocked');
  await audit(AUDIT_ACTIONS.USER_DELETED, { actor, target: user, ctx });
}

export async function restoreUser(id, actor, ctx) {
  const user = await findUserOr404(id, { withDeleted: true });
  if (!user.isDeleted) throw ApiError.badRequest('User is not deleted', 'NOT_DELETED');
  await user.restore();
  await audit(AUDIT_ACTIONS.USER_RESTORED, { actor, target: user, ctx });
  return user;
}

export async function blockUser(id, reason, actor, ctx) {
  assertNotSelf(actor, id, 'You cannot block your own account');
  const user = await findUserOr404(id);
  user.isBlocked = true;
  user.blockReason = reason || null;
  await user.save();
  await tokenService.revokeAllUserTokens(user._id, 'blocked'); // instant session kill (FR-USER-03)
  await audit(AUDIT_ACTIONS.USER_BLOCKED, { actor, target: user, ctx });
  return user;
}

export async function unblockUser(id, actor, ctx) {
  const user = await findUserOr404(id);
  user.isBlocked = false;
  user.blockReason = null;
  await user.save();
  await audit(AUDIT_ACTIONS.USER_UNBLOCKED, { actor, target: user, ctx });
  return user;
}

export async function changeRole(id, role, actor, ctx) {
  assertNotSelf(actor, id, 'You cannot change your own role');
  const user = await findUserOr404(id);
  const before = user.role;
  user.role = role;
  if (user.roleRequest && user.roleRequest === role) user.roleRequest = null;
  await user.save();
  await tokenService.revokeAllUserTokens(user._id, 'blocked'); // force new token with new role
  await audit(AUDIT_ACTIONS.USER_ROLE_CHANGED, {
    actor,
    target: user,
    ctx,
    before: { role: before },
    after: { role },
  });
  return user;
}

export async function approveRoleRequest(id, actor, ctx) {
  const user = await findUserOr404(id);
  if (!user.roleRequest) throw ApiError.badRequest('No pending role request', 'NO_PENDING_REQUEST');
  const before = user.role;
  user.role = user.roleRequest;
  user.roleRequest = null;
  await user.save();
  await tokenService.revokeAllUserTokens(user._id, 'blocked');
  await audit(AUDIT_ACTIONS.USER_ROLE_APPROVED, {
    actor,
    target: user,
    ctx,
    before: { role: before },
    after: { role: user.role },
  });
  return user;
}

export async function rejectRoleRequest(id, actor, ctx) {
  const user = await findUserOr404(id);
  if (!user.roleRequest) throw ApiError.badRequest('No pending role request', 'NO_PENDING_REQUEST');
  const rejected = user.roleRequest;
  user.roleRequest = null;
  await user.save();
  await audit(AUDIT_ACTIONS.USER_ROLE_REJECTED, {
    actor,
    target: user,
    ctx,
    before: { roleRequest: rejected },
  });
  return user;
}

export default {
  getMyProfile,
  updateMyProfile,
  updateMyAvatar,
  removeMyAvatar,
  deleteMyAccount,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  blockUser,
  unblockUser,
  changeRole,
  approveRoleRequest,
  rejectRoleRequest,
};
