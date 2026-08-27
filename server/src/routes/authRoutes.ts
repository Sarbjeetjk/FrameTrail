import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'user']).optional(),
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
  }),
});

// Rate Limited Auth Routes (Brute Force Protection)
router.post('/register', authLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.get('/me', protect, AuthController.getMe);
router.put('/profile', protect, AuthController.updateProfile);
router.post('/verify-password', protect, AuthController.verifyPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.get('/users', AuthController.getAllUsers);
router.get('/geoip', AuthController.getGeoIp);

export default router;
