/**
 * Auth routes — ARCHITECTURE.md §10.2, §17.1 (middleware order per route).
 *
 * Order per route: rateLimiter → validate → (authenticate) → controller.
 * Public: register, login, refresh, logout, forgot/reset password, verify email.
 * Private (Bearer access token): logout-all, me, change-password.
 */
import { Router } from 'express';

import * as authController from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authLimiter, passwordResetLimiter } from '../../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
  changePasswordSchema,
  verifyEmailParamsSchema,
} from '../../validations/auth.validation.js';

const router = Router();

// --- Public ---
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password/:token',
  validate(resetPasswordParamsSchema, 'params'),
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  '/verify-email/:token',
  validate(verifyEmailParamsSchema, 'params'),
  authController.verifyEmail
);

// --- Private (require a valid access token) ---
router.get('/me', authenticate, authController.me);
router.post('/logout-all', authenticate, authController.logoutAll);
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
