import express from 'express';
import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  me,
  updatePasswordAfterLogin,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Stricter rate limit for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Allow more requests in a 15-minute window to avoid blocking normal usage,
  // while still protecting against brute-force attacks.
  max: 150,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

router.get('/me', protect, me);
router.post('/me/password', protect, updatePasswordAfterLogin);

export default router;
