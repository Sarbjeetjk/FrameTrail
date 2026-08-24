import { Router } from 'express';
import authRoutes from './authRoutes';
import mediaRoutes from './mediaRoutes';
import uploadRoutes from './uploadRoutes';
import adminRoutes from './adminRoutes';
import contactRoutes from './contactRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

export default router;
