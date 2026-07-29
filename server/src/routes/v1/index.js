/**
 * API v1 router aggregator — ARCHITECTURE.md §6, §22 (versioning).
 *
 * Mounts every v1 module router. Phase 0 exposes health only; module routers
 * (auth, users, rooms, bookings, dashboard, reports, notifications, settings,
 * audit) plug in here in later phases with a single line each.
 */
import { Router } from 'express';

import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roomRoutes from './room.routes.js';
import bookingRoutes from './booking.routes.js';
import notificationRoutes from './notification.routes.js';
import jobRoutes from './jobs.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes); // Phase 1B
router.use('/users', userRoutes); // Phase 1C
router.use('/rooms', roomRoutes); // Phase 2
router.use('/bookings', bookingRoutes); // Phase 3
router.use('/notifications', notificationRoutes); // Phase 4
router.use('/jobs', jobRoutes); // Phase 4 (external cron trigger)

// --- Module routers (added in later phases) ---
// router.use('/users', userRoutes);         // Phase 6
// router.use('/rooms', roomRoutes);         // Phase 2
// router.use('/bookings', bookingRoutes);   // Phase 3
// router.use('/dashboard', dashboardRoutes);// Phase 5
// router.use('/reports', reportRoutes);     // Phase 6
// router.use('/notifications', notificationRoutes); // Phase 4
// router.use('/settings', settingsRoutes);  // Phase 6
// router.use('/audit', auditRoutes);        // Phase 6

export default router;
