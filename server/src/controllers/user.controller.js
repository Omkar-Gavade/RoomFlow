/**
 * User controller — ARCHITECTURE.md §16 (thin HTTP adapter, no business logic).
 *
 * Each handler: build request context → call ONE service function → return an
 * ApiResponse. List responses carry pagination in `meta`. Activate/Deactivate are
 * thin aliases over unblock/block (no separate schema field exists — §18.1).
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as userService from '../services/user.service.js';

const context = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.id,
});

// --- Self ---
export const getMe = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, { user: userService.getMyProfile(req.user) }, 'Profile').send(res)
);

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user._id, req.body, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Profile updated').send(res);
});

export const updateMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateMyAvatar(req.user._id, req.file, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Avatar updated').send(res);
});

export const removeMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.removeMyAvatar(req.user._id, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Avatar removed').send(res);
});

export const deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteMyAccount(req.user._id, context(req));
  return new ApiResponse(HTTP_STATUS.OK, null, 'Account deleted').send(res);
});

// --- Admin ---
export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  return new ApiResponse(HTTP_STATUS.OK, users, 'Users fetched', meta).send(res);
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User fetched').send(res);
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.CREATED, { user }, 'User created').send(res);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User updated').send(res);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, null, 'User deleted').send(res);
});

export const restoreUser = asyncHandler(async (req, res) => {
  const user = await userService.restoreUser(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User restored').send(res);
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await userService.blockUser(req.params.id, req.body.reason, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User blocked').send(res);
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await userService.unblockUser(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User unblocked').send(res);
});

// Activate/Deactivate = semantic aliases of unblock/block (§18.1: no isActive field).
export const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.unblockUser(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User activated').send(res);
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.blockUser(req.params.id, req.body.reason, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'User deactivated').send(res);
});

export const changeRole = asyncHandler(async (req, res) => {
  const user = await userService.changeRole(req.params.id, req.body.role, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Role changed').send(res);
});

export const approveRole = asyncHandler(async (req, res) => {
  const user = await userService.approveRoleRequest(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Role request approved').send(res);
});

export const rejectRole = asyncHandler(async (req, res) => {
  const user = await userService.rejectRoleRequest(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Role request rejected').send(res);
});

export default {
  getMe,
  updateMe,
  updateMyAvatar,
  removeMyAvatar,
  deleteMe,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  blockUser,
  unblockUser,
  activateUser,
  deactivateUser,
  changeRole,
  approveRole,
  rejectRole,
};
