/**
 * Dashboard controller — ARCHITECTURE.md §16 (thin adapter).
 * One call → one payload (FR-DASH-04).
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as dashboardService from '../services/dashboard.service.js';

export const admin = asyncHandler(async (_req, res) => {
  const data = await dashboardService.adminDashboard();
  return new ApiResponse(HTTP_STATUS.OK, data, 'Admin dashboard').send(res);
});

export const staff = asyncHandler(async (req, res) => {
  const data = await dashboardService.staffDashboard(req.user);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Staff dashboard').send(res);
});

export const student = asyncHandler(async (req, res) => {
  const data = await dashboardService.studentDashboard(req.user);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Student dashboard').send(res);
});

export const stats = asyncHandler(async (req, res) => {
  const data = await dashboardService.stats(req.user);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Dashboard stats').send(res);
});

export const activity = asyncHandler(async (req, res) => {
  const data = await dashboardService.activity(req.query.limit);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Recent activity').send(res);
});

export default { admin, staff, student, stats, activity };
