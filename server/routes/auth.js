import { Router } from 'express';
import {
  register, login, refreshToken, logout, logoutAll,
  getProfile, updateProfile,
  verifyEmailHandler, forgotPassword, resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema, loginSchema, updateProfileSchema,
  forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema,
} from '../validators/auth.schema.js';

const router = Router();

// ── Public ───────────────────────────────────────────────────
router.post('/register',        validate(registerSchema),       register);
router.post('/login',           validate(loginSchema),          login);
router.post('/refresh',         refreshToken);
router.post('/logout',          logout);
router.post('/verify-email',    validate(verifyEmailSchema),    verifyEmailHandler);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  resetPassword);

// ── Protected ────────────────────────────────────────────────
router.get ('/me',           protect, getProfile);
router.get ('/profile',      protect, getProfile);
router.put ('/profile',      protect, validate(updateProfileSchema), updateProfile);
router.post('/logout-all',   protect, logoutAll);

export default router;
