/**
 * Settings controller — ARCHITECTURE.md §16, §10.9.
 * System config + holidays live in settings.service. Profile/password DELEGATE to
 * the existing user/auth services (no duplicated logic).
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from '../utils/cookieOptions.js';
import * as settingsService from '../services/settings.service.js';
import * as userService from '../services/user.service.js';
import * as authService from '../services/auth.service.js';

const context = (req) => ({ ipAddress: req.ip, userAgent: req.headers['user-agent'], requestId: req.id });

// --- Profile / password (delegated) ---
export const getProfile = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, { user: req.user }, 'Profile').send(res)
);

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(req.user._id, req.body, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { user }, 'Profile updated').send(res);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.changePassword(
    req.user._id, req.body.currentPassword, req.body.newPassword, context(req)
  );
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return new ApiResponse(HTTP_STATUS.OK, { accessToken }, 'Password changed').send(res);
});

// --- System config (admin) ---
export const getSystem = asyncHandler(async (_req, res) =>
  new ApiResponse(HTTP_STATUS.OK, { config: await settingsService.getSystemConfig() }, 'System config').send(res)
);

export const updateSystem = asyncHandler(async (req, res) => {
  const config = await settingsService.updateSystemConfig(req.body, req.user);
  return new ApiResponse(HTTP_STATUS.OK, { config }, 'System config updated').send(res);
});

export const updateBookingRules = asyncHandler(async (req, res) => {
  const config = await settingsService.updateBookingRules(req.body, req.user);
  return new ApiResponse(HTTP_STATUS.OK, { config }, 'Booking rules updated').send(res);
});

// --- Holidays ---
export const listHolidays = asyncHandler(async (_req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await settingsService.listHolidays(), 'Holidays').send(res)
);

export const addHoliday = asyncHandler(async (req, res) => {
  const holidays = await settingsService.addHoliday(req.body, req.user);
  return new ApiResponse(HTTP_STATUS.CREATED, holidays, 'Holiday added').send(res);
});

export const removeHoliday = asyncHandler(async (req, res) => {
  const holidays = await settingsService.removeHoliday(req.params.id, req.user);
  return new ApiResponse(HTTP_STATUS.OK, holidays, 'Holiday removed').send(res);
});

export default {
  getProfile, updateProfile, changePassword,
  getSystem, updateSystem, updateBookingRules,
  listHolidays, addHoliday, removeHoliday,
};
