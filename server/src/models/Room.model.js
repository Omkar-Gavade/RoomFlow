/**
 * Room model — ARCHITECTURE.md §18.2, §7.2 (embed decisions), §7.3 (indexes).
 *
 * Bounded sub-structures (facilities, images, operatingHours, blackoutDates) are
 * EMBEDDED because they are always read with the room and never queried alone.
 * Model-level validators only (image count, single primary, hours order).
 * Cross-document rules (e.g. block delete when future bookings exist) are service
 * logic and are NOT here. Soft-delete via plugin (§18.2, FR-ROOM-04).
 */
import mongoose from 'mongoose';

import { ROOM_CATEGORY_VALUES, ROOM_STATUS, ROOM_STATUS_VALUES } from '../constants/roomCategories.js';
import { FACILITY_VALUES } from '../constants/facilities.js';

import { softDeletePlugin } from './plugins/softDelete.plugin.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const blackoutSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const operatingHoursSchema = new Schema(
  {
    open: { type: String, default: '08:00', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'open must be HH:mm'] },
    close: { type: String, default: '20:00', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'close must be HH:mm'] },
    // 0 = Sunday … 6 = Saturday (default Mon–Fri).
    days: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      validate: {
        validator: (arr) => arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: 'days must be integers 0–6',
      },
    },
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Room code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]{3,20}$/, 'Code must be 3–20 chars: A–Z, 0–9, hyphen'],
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: ROOM_CATEGORY_VALUES, message: 'Invalid category: {VALUE}' },
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [1000, 'Capacity cannot exceed 1000'],
    },
    building: { type: String, required: [true, 'Building is required'], trim: true, maxlength: 100 },
    floor: { type: Number, min: 0, max: 50, default: 0 },
    description: { type: String, trim: true, maxlength: 1000 },
    facilities: {
      type: [String],
      enum: { values: FACILITY_VALUES, message: 'Invalid facility: {VALUE}' },
      default: [],
      validate: {
        validator: (arr) => new Set(arr).size === arr.length,
        message: 'Duplicate facilities are not allowed',
      },
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: [
        { validator: (arr) => arr.length <= 5, message: 'A room can have at most 5 images' },
        {
          validator: (arr) => arr.filter((img) => img.isPrimary).length <= 1,
          message: 'Only one image can be primary',
        },
      ],
    },
    operatingHours: { type: operatingHoursSchema, default: () => ({}) },
    blackoutDates: { type: [blackoutSchema], default: [] },
    status: {
      type: String,
      enum: { values: ROOM_STATUS_VALUES, message: 'Invalid status: {VALUE}' },
      default: ROOM_STATUS.ACTIVE,
    },
    requiresApproval: { type: Boolean, default: true },
    guestBookable: { type: Boolean, default: false },
    // Reserved for hotel/commercial mode (§18.2, future scope).
    pricePerHour: { type: Number, min: 0, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

roomSchema.plugin(softDeletePlugin);
roomSchema.plugin(toJSONPlugin);

// --- Indexes (§7.3) ---
roomSchema.index({ category: 1, capacity: 1, status: 1 }); // primary listing filter
roomSchema.index({ building: 1, floor: 1 }); // location browsing
roomSchema.index({ name: 'text', description: 'text' }); // search box

// Model-level integrity: operating close must be after open (string HH:mm compares lexically within a day).
roomSchema.pre('validate', function validateHours(next) {
  if (this.operatingHours?.open && this.operatingHours?.close) {
    if (this.operatingHours.close <= this.operatingHours.open) {
      this.invalidate('operatingHours.close', 'close must be after open');
    }
  }
  next();
});

export const Room = model('Room', roomSchema);
export default Room;
