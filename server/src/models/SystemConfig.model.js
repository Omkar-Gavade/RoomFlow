/**
 * SystemConfig model — ARCHITECTURE.md §18.6, §FR-SET-03/04.
 *
 * Singleton (enforced by unique `key: 'global'`) holding institution-wide config:
 * working hours, booking rules, auto-approve, holidays, reminder lead, maintenance.
 * Read through settings.service's cached accessor (5-min TTL) so it never adds a
 * DB read to the hot path.
 */
import mongoose from 'mongoose';

import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const holidaySchema = new Schema(
  {
    date: { type: Date, required: true },
    name: { type: String, trim: true, maxlength: 100 },
  },
  { _id: true }
);

const systemConfigSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true, immutable: true },
    institutionName: { type: String, trim: true, default: 'RoomFlow' },
    workingHours: {
      open: { type: String, default: '08:00', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'open must be HH:mm'] },
      close: { type: String, default: '20:00', match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'close must be HH:mm'] },
      days: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    minBookingDurationMinutes: { type: Number, default: 15, min: 5 },
    maxBookingDurationMinutes: { type: Number, default: 240, min: 15 },
    maxAdvanceBookingDays: { type: Number, default: 60, min: 1 },
    maxActiveBookingsPerUser: { type: Number, default: 5, min: 1 },
    autoApproveStaff: { type: Boolean, default: false },
    reminderLeadMinutes: { type: Number, default: 60, min: 5 },
    holidays: { type: [holidaySchema], default: [] },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

systemConfigSchema.plugin(toJSONPlugin);

export const SystemConfig = model('SystemConfig', systemConfigSchema);
export default SystemConfig;
