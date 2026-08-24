import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Cloudinary upload endpoint for Photos & Videos
router.post('/cloudinary', protect, adminOnly, UploadController.uploadToCloudinary);

// Presigned URL generation for Cloudflare R2 direct client PUT uploads (For Heavy Movies)
router.post('/presigned-url', protect, adminOnly, UploadController.getPresignedUrl);
router.all('/simulated-upload', UploadController.handleSimulatedUpload);

export default router;
