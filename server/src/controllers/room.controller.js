/**
 * Room controller — ARCHITECTURE.md §16 (thin HTTP adapter, no business logic).
 * Build context → call one service function → ApiResponse. List carries `meta`.
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as roomService from '../services/room.service.js';

const context = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.id,
});

// --- Reads ---
export const listRooms = asyncHandler(async (req, res) => {
  const { rooms, meta } = await roomService.listRooms(req.query);
  return new ApiResponse(HTTP_STATUS.OK, rooms, 'Rooms fetched', meta).send(res);
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id);
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Room fetched').send(res);
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await roomService.getCategories();
  return new ApiResponse(HTTP_STATUS.OK, categories, 'Categories fetched').send(res);
});

export const getFacilities = asyncHandler(async (_req, res) => {
  const facilities = roomService.getFacilities();
  return new ApiResponse(HTTP_STATUS.OK, facilities, 'Facilities fetched').send(res);
});

// --- Writes (admin) ---
export const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.CREATED, { room }, 'Room created').send(res);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.params.id, req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Room updated').send(res);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, null, 'Room deleted').send(res);
});

export const restoreRoom = asyncHandler(async (req, res) => {
  const room = await roomService.restoreRoom(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Room restored').send(res);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const room = await roomService.updateStatus(req.params.id, req.body.status, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Room status updated').send(res);
});

export const updateFacilities = asyncHandler(async (req, res) => {
  const room = await roomService.updateFacilities(req.params.id, req.body.facilities, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Facilities updated').send(res);
});

export const updateOperatingHours = asyncHandler(async (req, res) => {
  const room = await roomService.updateOperatingHours(req.params.id, req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Operating hours updated').send(res);
});

export const addImages = asyncHandler(async (req, res) => {
  const room = await roomService.addImages(req.params.id, req.files, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.CREATED, { room }, 'Images uploaded').send(res);
});

export const setPrimaryImage = asyncHandler(async (req, res) => {
  const room = await roomService.setPrimaryImage(req.params.id, req.params.imageId, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Primary image set').send(res);
});

export const removeImage = asyncHandler(async (req, res) => {
  const room = await roomService.removeImage(req.params.id, req.params.imageId, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { room }, 'Image removed').send(res);
});

export default {
  listRooms,
  getRoom,
  getCategories,
  getFacilities,
  createRoom,
  updateRoom,
  deleteRoom,
  restoreRoom,
  updateStatus,
  updateFacilities,
  updateOperatingHours,
  addImages,
  setPrimaryImage,
  removeImage,
};
