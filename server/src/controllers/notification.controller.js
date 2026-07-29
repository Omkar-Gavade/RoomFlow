/**
 * Notification controller — ARCHITECTURE.md §16 (thin adapter). Owner-scoped in service.
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as notificationService from '../services/notification.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await notificationService.listMine(req.user._id, req.query);
  return new ApiResponse(HTTP_STATUS.OK, items, 'Notifications fetched', meta).send(res);
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, { count }, 'Unread count').send(res);
});

export const getOne = asyncHandler(async (req, res) => {
  const notification = await notificationService.getMine(req.params.id, req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, { notification }, 'Notification').send(res);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, { notification }, 'Marked read').send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, null, 'All marked read').send(res);
});

export const remove = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, null, 'Notification deleted').send(res);
});

export const clearRead = asyncHandler(async (req, res) => {
  const result = await notificationService.clearRead(req.user._id);
  return new ApiResponse(HTTP_STATUS.OK, { deleted: result.deletedCount }, 'Read notifications cleared').send(res);
});

export const broadcast = asyncHandler(async (req, res) => {
  const result = await notificationService.broadcast(req.body, req.user);
  return new ApiResponse(HTTP_STATUS.CREATED, result, 'Broadcast sent').send(res);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.updatePreferences(req.user._id, req.body);
  return new ApiResponse(HTTP_STATUS.OK, { preferences }, 'Preferences updated').send(res);
});

export default { list, unreadCount, getOne, markRead, markAllRead, remove, clearRead, broadcast, updatePreferences };
