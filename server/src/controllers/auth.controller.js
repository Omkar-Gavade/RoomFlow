/**
 * Auth controller — ARCHITECTURE.md §16 (thin HTTP adapter).
 *
 * NO business logic. Each handler: build request context → call one service
 * function → set/clear the refresh cookie → return an ApiResponse. The access
 * token is returned in the body; the refresh token travels ONLY in the httpOnly
 * cookie (§11.1) and is never placed in the JSON.
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearCookieOptions,
} from '../utils/cookieOptions.js';
import * as authService from '../services/auth.service.js';

/** Derive the audit/session context from the request. */
const context = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.id,
});

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, context(req));
  return new ApiResponse(HTTP_STATUS.CREATED, { user }, 'Registration successful. Please verify your email.').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password,
    context(req)
  );
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(HTTP_STATUS.OK, { user, accessToken }, 'Login successful').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.refresh(
    req.cookies?.[REFRESH_COOKIE_NAME],
    context(req)
  );
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(HTTP_STATUS.OK, { accessToken }, 'Token refreshed').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME], context(req));
  res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
  return new ApiResponse(HTTP_STATUS.OK, null, 'Logged out').send(res);
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id, context(req));
  res.clearCookie(REFRESH_COOKIE_NAME, clearCookieOptions());
  return new ApiResponse(HTTP_STATUS.OK, null, 'Logged out from all devices').send(res);
});

export const me = asyncHandler(async (req, res) => {
  const data = authService.getMe(req.user);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Current user').send(res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email, context(req));
  // Generic response regardless of whether the email exists (no enumeration).
  return new ApiResponse(HTTP_STATUS.OK, null, 'If the email exists, a reset link has been sent').send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password, context(req));
  return new ApiResponse(HTTP_STATUS.OK, null, 'Password reset successful. Please log in.').send(res);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
    context(req)
  );
  setRefreshCookie(res, refreshToken);
  return new ApiResponse(HTTP_STATUS.OK, { accessToken }, 'Password changed').send(res);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.params.token, context(req));
  return new ApiResponse(HTTP_STATUS.OK, null, 'Email verified').send(res);
});

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
};
