/**
 * Report controller — ARCHITECTURE.md §16 (thin adapter). §10.6.
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { toCSV } from '../utils/csvExporter.js';
import * as reportService from '../services/report.service.js';

export const daily = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.daily(req.query.date), 'Daily report').send(res)
);
export const weekly = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.weekly(req.query.weekStart), 'Weekly report').send(res)
);
export const monthly = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.monthly(req.query.month), 'Monthly report').send(res)
);
export const utilization = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.utilization(req.query), 'Utilization report').send(res)
);
export const mostBooked = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.mostBooked(req.query), 'Most booked rooms').send(res)
);
export const peakHours = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.peakHours(req.query), 'Peak hours').send(res)
);
export const userActivity = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.userActivity(req.query), 'User activity').send(res)
);
export const cancellations = asyncHandler(async (req, res) =>
  new ApiResponse(HTTP_STATUS.OK, await reportService.cancellations(req.query), 'Cancellations').send(res)
);

export const exportReport = asyncHandler(async (req, res) => {
  const result = await reportService.exportRows(req.query.type, req.query);
  if (!result) throw ApiError.badRequest('Unsupported export type', 'UNSUPPORTED_EXPORT');
  const csv = toCSV(result.rows, result.columns);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${req.query.type}-report.csv"`);
  return res.status(HTTP_STATUS.OK).send(csv);
});

export default { daily, weekly, monthly, utilization, mostBooked, peakHours, userActivity, cancellations, exportReport };
