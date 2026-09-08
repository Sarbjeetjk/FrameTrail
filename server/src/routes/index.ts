import { Router } from 'express';
import authRoutes from './authRoutes';
import mediaRoutes from './mediaRoutes';
import uploadRoutes from './uploadRoutes';
import adminRoutes from './adminRoutes';
import contactRoutes from './contactRoutes';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

// Public / Authenticated Client Activity Telemetry Endpoint
router.post('/logs', AdminController.createClientLog);

export default router;
