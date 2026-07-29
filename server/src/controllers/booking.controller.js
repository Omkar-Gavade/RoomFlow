/**
 * Booking controller — ARCHITECTURE.md §16 (thin HTTP adapter, no business logic).
 * Also hosts the availability read handlers (booking-derived data) wired into the
 * frozen /rooms availability paths (§10.3).
 */
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as bookingService from '../services/booking.service.js';
import * as availability from '../services/availability.service.js';

const context = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.id,
});

// --- Create / transitions ---
export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.CREATED, { booking }, 'Booking created').send(res);
});

export const checkConflict = asyncHandler(async (req, res) => {
  const result = await bookingService.checkConflict(req.body);
  return new ApiResponse(HTTP_STATUS.OK, result, 'Conflict check').send(res);
});

export const approveBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.approveBooking(req.params.id, req.body.remark, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking approved').send(res);
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rejectBooking(req.params.id, req.body.reason, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking rejected').send(res);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.body.reason, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking cancelled').send(res);
});

export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(req.params.id, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking completed').send(res);
});

export const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rescheduleBooking(req.params.id, req.body, req.user, context(req));
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking rescheduled').send(res);
});

// --- Reads ---
export const listBookings = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.listBookings(req.query, req.user);
  return new ApiResponse(HTTP_STATUS.OK, bookings, 'Bookings fetched', meta).send(res);
});

export const myBookings = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.myBookings(req.query, req.user);
  return new ApiResponse(HTTP_STATUS.OK, bookings, 'My bookings', meta).send(res);
});

export const pendingBookings = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.pendingBookings(req.query);
  return new ApiResponse(HTTP_STATUS.OK, bookings, 'Pending bookings', meta).send(res);
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  return new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking fetched').send(res);
});

export const getBookingHistory = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user);
  return new ApiResponse(HTTP_STATUS.OK, { history: booking.statusHistory }, 'Booking history').send(res);
});

export const calendar = asyncHandler(async (req, res) => {
  const events = await bookingService.calendarFeed(req.query, req.user);
  return new ApiResponse(HTTP_STATUS.OK, events, 'Calendar feed').send(res);
});

// --- Availability (frozen /rooms paths, §10.3) ---
export const roomAvailability = asyncHandler(async (req, res) => {
  const data = await availability.getRoomAvailability(req.params.id, req.query.date);
  return new ApiResponse(HTTP_STATUS.OK, data, 'Room availability').send(res);
});

export const availableRooms = asyncHandler(async (req, res) => {
  const rooms = await availability.findAvailableRooms(req.query);
  return new ApiResponse(HTTP_STATUS.OK, rooms, 'Available rooms').send(res);
});

export default {
  createBooking,
  checkConflict,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
  listBookings,
  myBookings,
  pendingBookings,
  getBooking,
  getBookingHistory,
  calendar,
  roomAvailability,
  availableRooms,
};
