/**
 * Room service — ARCHITECTURE.md §16, §10.3, §18.2, §8.2 (referential integrity).
 *
 * All room-management business logic + audit. Reuses the upload service
 * (Cloudinary), pagination helpers, and soft-delete plugin. Cross-collection
 * integrity guards read the Booking collection READ-ONLY (§8.2 / FR-ROOM-04 /
 * §19.2) — this is not booking logic or conflict detection, only "may this room
 * be deleted / deactivated?".
 */
import { Room } from '../models/Room.model.js';
import { Booking } from '../models/Booking.model.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta, containsRegex, parseSort } from '../utils/pagination.js';
import { env } from '../config/env.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';
import { ROOM_CATEGORY_VALUES, ROOM_STATUS } from '../constants/roomCategories.js';
import { FACILITY_VALUES } from '../constants/facilities.js';
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS } from '../constants/bookingStatus.js';

import { uploadImage, deleteImage } from './upload.service.js';
import * as auditService from './audit.service.js';

const SORTABLE = ['code', 'name', 'category', 'capacity', 'building', 'floor', 'createdAt'];
const MAX_IMAGES = 5;

// --- helpers ---------------------------------------------------------------

function audit(action, { actor, target, ctx = {}, before, after }) {
  return auditService.record({
    actor: actor?._id || null,
    actorRole: actor?.role,
    actorName: actor?.name,
    action,
    entityType: AUDIT_ENTITY_TYPES.ROOM,
    entityId: target?._id || target || null,
    before,
    after,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    status: 'success',
    metadata: { requestId: ctx.requestId },
  });
}

async function findRoomOr404(id, { withDeleted = false } = {}) {
  let q = Room.findById(id);
  if (withDeleted) q = q.setOptions({ withDeleted: true });
  const room = await q;
  if (!room) throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  return room;
}

/** §8.2 / §19.2 — block delete/deactivate when future active bookings exist. */
async function assertNoFutureBookings(roomId, statuses, message) {
  const count = await Booking.countDocuments({
    room: roomId,
    status: { $in: statuses },
    startsAt: { $gt: new Date() },
  });
  if (count > 0) throw ApiError.conflict(message, 'ROOM_HAS_ACTIVE_BOOKINGS');
}

// ===========================================================================
// Reads (all authenticated roles — room:read)
// ===========================================================================

export async function listRooms(query) {
  const { page, limit, skip } = getPagination({ ...query, limit: query.limit || 12 });
  const sort = parseSort(query.sort, SORTABLE, { createdAt: -1 });

  const filter = { isDeleted: false };
  if (query.category) filter.category = query.category;
  if (query.building) filter.building = containsRegex(query.building);
  if (query.floor !== undefined) filter.floor = query.floor;
  if (query.status) filter.status = query.status;
  if (query.minCapacity || query.maxCapacity) {
    filter.capacity = {};
    if (query.minCapacity) filter.capacity.$gte = query.minCapacity;
    if (query.maxCapacity) filter.capacity.$lte = query.maxCapacity;
  }
  if (query.facilities?.length) filter.facilities = { $all: query.facilities };
  if (query.search) {
    const rx = containsRegex(query.search);
    filter.$or = [{ name: rx }, { code: rx }, { description: rx }];
  }

  const [rooms, total] = await Promise.all([
    Room.find(filter).select('-__v').sort(sort).skip(skip).limit(limit).lean(),
    Room.countDocuments(filter),
  ]);
  return { rooms, meta: buildMeta(total, page, limit) };
}

export async function getRoomById(id) {
  const room = await Room.findById(id).select('-__v');
  if (!room) throw ApiError.notFound('Room not found', 'ROOM_NOT_FOUND');
  return room;
}

/** Category vocabulary with live room counts (§10.3 GET /rooms/categories). */
export async function getCategories() {
  const counts = await Room.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [c._id, c.count]));
  return ROOM_CATEGORY_VALUES.map((category) => ({ category, count: map.get(category) || 0 }));
}

/** Facility vocabulary (§10.3 GET /rooms/facilities). */
export function getFacilities() {
  return FACILITY_VALUES;
}

// ===========================================================================
// Writes (admin)
// ===========================================================================

export async function createRoom(dto, actor, ctx) {
  const dup = await Room.findOne({ code: dto.code }).setOptions({ withDeleted: true });
  if (dup) throw ApiError.conflict('Room code already exists', 'ROOM_CODE_EXISTS');

  const room = await Room.create({ ...dto, createdBy: actor._id });
  await audit(AUDIT_ACTIONS.ROOM_CREATED, { actor, target: room, ctx, after: { code: room.code } });
  return room;
}

export async function updateRoom(id, dto, actor, ctx) {
  const room = await findRoomOr404(id);
  if (dto.code && dto.code !== room.code) {
    const dup = await Room.findOne({ code: dto.code }).setOptions({ withDeleted: true });
    if (dup) throw ApiError.conflict('Room code already exists', 'ROOM_CODE_EXISTS');
  }
  // Full replace of core attributes (images/facilities/hours have own endpoints).
  const fields = [
    'code', 'name', 'category', 'capacity', 'building',
    'floor', 'description', 'requiresApproval', 'guestBookable', 'pricePerHour',
  ];
  for (const f of fields) if (dto[f] !== undefined) room[f] = dto[f];
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_UPDATED, { actor, target: room, ctx });
  return room;
}

export async function deleteRoom(id, actor, ctx) {
  const room = await findRoomOr404(id);
  await assertNoFutureBookings(
    id,
    ACTIVE_BOOKING_STATUSES,
    'Room has upcoming bookings and cannot be deleted'
  );
  await room.softDelete();
  await audit(AUDIT_ACTIONS.ROOM_DELETED, { actor, target: room, ctx });
}

export async function restoreRoom(id, actor, ctx) {
  const room = await findRoomOr404(id, { withDeleted: true });
  if (!room.isDeleted) throw ApiError.badRequest('Room is not deleted', 'NOT_DELETED');
  await room.restore();
  await audit(AUDIT_ACTIONS.ROOM_RESTORED, { actor, target: room, ctx });
  return room;
}

export async function updateStatus(id, status, actor, ctx) {
  const room = await findRoomOr404(id);
  // §19.2 — cannot deactivate a room that still has future approved bookings.
  if (status === ROOM_STATUS.INACTIVE) {
    await assertNoFutureBookings(
      id,
      [BOOKING_STATUS.APPROVED],
      'Room has approved bookings and cannot be set inactive'
    );
  }
  const before = room.status;
  room.status = status;
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_STATUS_CHANGED, {
    actor, target: room, ctx, before: { status: before }, after: { status },
  });
  return room;
}

export async function updateFacilities(id, facilities, actor, ctx) {
  const room = await findRoomOr404(id);
  room.facilities = facilities;
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_FACILITIES_UPDATED, { actor, target: room, ctx });
  return room;
}

export async function updateOperatingHours(id, hours, actor, ctx) {
  const room = await findRoomOr404(id);
  room.operatingHours = hours; // model pre-validate enforces close > open
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_HOURS_UPDATED, { actor, target: room, ctx });
  return room;
}

// --- Images ---------------------------------------------------------------

export async function addImages(id, files, actor, ctx) {
  if (!files || files.length === 0) throw ApiError.badRequest('No images uploaded', 'NO_FILES');
  const room = await findRoomOr404(id);
  if (room.images.length + files.length > MAX_IMAGES) {
    throw ApiError.badRequest(`A room can have at most ${MAX_IMAGES} images`, 'MAX_IMAGES');
  }

  const uploaded = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const { url, publicId } = await uploadImage(file.buffer, {
      folder: `${env.CLOUDINARY_FOLDER}/rooms`,
    });
    uploaded.push({ url, publicId, isPrimary: false });
  }

  const hadPrimary = room.images.some((i) => i.isPrimary);
  room.images.push(...uploaded);
  if (!hadPrimary && room.images.length) room.images[0].isPrimary = true;
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_IMAGE_ADDED, { actor, target: room, ctx });
  return room;
}

export async function setPrimaryImage(id, imageId, actor, ctx) {
  const room = await findRoomOr404(id);
  const img = room.images.id(imageId);
  if (!img) throw ApiError.notFound('Image not found', 'IMAGE_NOT_FOUND');
  room.images.forEach((i) => {
    i.isPrimary = false;
  });
  img.isPrimary = true;
  await room.save();
  await audit(AUDIT_ACTIONS.ROOM_PRIMARY_IMAGE_SET, { actor, target: room, ctx });
  return room;
}

export async function removeImage(id, imageId, actor, ctx) {
  const room = await findRoomOr404(id);
  const img = room.images.id(imageId);
  if (!img) throw ApiError.notFound('Image not found', 'IMAGE_NOT_FOUND');

  const { publicId, isPrimary } = img;
  room.images.pull({ _id: imageId });
  // Promote a new primary if we removed the primary and others remain.
  if (isPrimary && room.images.length) room.images[0].isPrimary = true;
  await room.save();
  if (publicId) await deleteImage(publicId).catch(() => {});
  await audit(AUDIT_ACTIONS.ROOM_IMAGE_REMOVED, { actor, target: room, ctx });
  return room;
}

export default {
  listRooms,
  getRoomById,
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
