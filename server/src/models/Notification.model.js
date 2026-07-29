/**
 * Notification model — ARCHITECTURE.md §18.4, §7.3.
 *
 * Separate collection (unbounded, independently paginated, own TTL policy — §7.2).
 * title/message are DENORMALISED at creation so the bell dropdown needs no joins
 * (§9.3). TTL index auto-prunes after 90 days. Model-level fields only; dispatch
 * logic (email send, triggers) is service work (Phase 4).
 */
import mongoose from 'mongoose';

import {
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_VALUES,
  EMAIL_STATUS,
  EMAIL_STATUS_VALUES,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_PRIORITY_VALUES,
} from '../constants/notificationTypes.js';

import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPE_VALUES, message: 'Invalid notification type: {VALUE}' },
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    relatedBooking: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    link: { type: String, trim: true, default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    channel: {
      type: String,
      enum: NOTIFICATION_CHANNEL_VALUES,
      default: NOTIFICATION_CHANNELS.IN_APP,
    },
    emailStatus: {
      type: String,
      enum: EMAIL_STATUS_VALUES,
      default: EMAIL_STATUS.PENDING,
    },
    emailError: { type: String, default: null },
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITY_VALUES,
      default: NOTIFICATION_PRIORITY.NORMAL,
    },
  },
  { timestamps: true }
);

notificationSchema.plugin(toJSONPlugin);

// --- Indexes (§7.3) ---
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // bell dropdown query
// TTL: auto-delete 90 days after creation (7 776 000 s). Keeps the hot collection small.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Notification = model('Notification', notificationSchema);
export default Notification;
