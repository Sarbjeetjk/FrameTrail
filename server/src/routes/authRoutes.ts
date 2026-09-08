import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    purpose: z.enum(['register', 'forgot_password', 'profile_update', 'account_unlock']).optional(),
    name: z.string().optional(),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(4, 'OTP code is required'),
    purpose: z.enum(['register', 'forgot_password', 'profile_update', 'account_unlock']).optional(),
  }),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user']).optional(),
    otp: z.string().min(4, 'Verification code is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    otp: z.string().optional(),
  }),
});

// Rate Limited Auth Routes (Brute Force Protection)
router.post('/send-otp', authLimiter, validateRequest(sendOtpSchema), AuthController.sendOtp);
router.post('/verify-otp', authLimiter, validateRequest(verifyOtpSchema), AuthController.verifyOtp);
router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.get('/me', protect, AuthController.getMe);
router.put('/profile', protect, AuthController.updateProfile);
router.post('/verify-password', protect, AuthController.verifyPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/unlock-account', authLimiter, AuthController.unlockAccount);
router.get('/users', protect, adminOnly, AuthController.getAllUsers);
router.get('/geoip', AuthController.getGeoIp);

export default router;
