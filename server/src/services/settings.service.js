/**
 * Settings service — ARCHITECTURE.md §10.9, §18.6, §FR-SET.
 *
 * Owns SystemConfig (the singleton) behind a 5-minute in-memory cache (FR-SET-04)
 * so config reads never add a DB hit to the hot path. Writes invalidate the cache
 * and are audited. Profile/password operations are NOT duplicated here — the
 * controller delegates those to the existing user/auth services (DRY).
 */
import { SystemConfig } from '../models/SystemConfig.model.js';
import * as auditService from './audit.service.js';
import { ApiError } from '../utils/ApiError.js';
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '../constants/auditActions.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = null;
let cachedAt = 0;

function invalidate() {
  cache = null;
  cachedAt = 0;
}

/** Ensure the singleton exists, creating it with defaults on first access. */
async function ensureConfig() {
  let config = await SystemConfig.findOne({ key: 'global' });
  if (!config) config = await SystemConfig.create({ key: 'global' });
  return config;
}

/** Cached accessor used across the app (FR-SET-04). */
export async function getConfig() {
  const now = Date.now();
  if (cache && now - cachedAt < CACHE_TTL_MS) return cache;
  cache = await ensureConfig();
  cachedAt = now;
  return cache;
}

function audit(action, actor, config, before) {
  return auditService.record({
    actor: actor?._id || null,
    actorRole: actor?.role,
    actorName: actor?.name,
    action,
    entityType: AUDIT_ENTITY_TYPES.SYSTEM_CONFIG,
    entityId: config._id,
    before,
    ipAddress: actor?.ctx?.ipAddress,
    status: 'success',
  });
}

const SYSTEM_FIELDS = [
  'institutionName', 'workingHours', 'minBookingDurationMinutes', 'maxBookingDurationMinutes',
  'maxAdvanceBookingDays', 'maxActiveBookingsPerUser', 'autoApproveStaff', 'reminderLeadMinutes',
  'maintenanceMode',
];

export async function getSystemConfig() {
  return getConfig();
}

export async function updateSystemConfig(dto, actor) {
  const config = await ensureConfig();
  for (const f of SYSTEM_FIELDS) if (dto[f] !== undefined) config[f] = dto[f];
  config.updatedBy = actor._id;
  await config.save();
  invalidate();
  await audit(AUDIT_ACTIONS.SYSTEM_CONFIG_UPDATED, actor, config);
  return config;
}

const RULE_FIELDS = [
  'minBookingDurationMinutes', 'maxBookingDurationMinutes', 'maxAdvanceBookingDays',
  'maxActiveBookingsPerUser', 'autoApproveStaff',
];

export async function updateBookingRules(dto, actor) {
  const config = await ensureConfig();
  for (const f of RULE_FIELDS) if (dto[f] !== undefined) config[f] = dto[f];
  config.updatedBy = actor._id;
  await config.save();
  invalidate();
  await audit(AUDIT_ACTIONS.BOOKING_RULES_UPDATED, actor, config);
  return config;
}

export async function listHolidays() {
  const config = await getConfig();
  return config.holidays;
}

export async function addHoliday(dto, actor) {
  const config = await ensureConfig();
  config.holidays.push({ date: dto.date, name: dto.name });
  config.updatedBy = actor._id;
  await config.save();
  invalidate();
  await audit(AUDIT_ACTIONS.HOLIDAY_ADDED, actor, config);
  return config.holidays;
}

export async function removeHoliday(holidayId, actor) {
  const config = await ensureConfig();
  const holiday = config.holidays.id(holidayId);
  if (!holiday) throw ApiError.notFound('Holiday not found', 'HOLIDAY_NOT_FOUND');
  config.holidays.pull({ _id: holidayId });
  config.updatedBy = actor._id;
  await config.save();
  invalidate();
  await audit(AUDIT_ACTIONS.HOLIDAY_REMOVED, actor, config);
  return config.holidays;
}

export default {
  getConfig,
  getSystemConfig,
  updateSystemConfig,
  updateBookingRules,
  listHolidays,
  addHoliday,
  removeHoliday,
};
