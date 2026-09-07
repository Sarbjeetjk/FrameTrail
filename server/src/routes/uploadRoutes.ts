import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Cloudinary upload endpoint for Photos & Videos (Protected for authenticated users)
router.post('/cloudinary', protect, UploadController.uploadToCloudinary);

// Presigned URL generation for Cloudflare R2 direct client PUT uploads
router.post('/presigned-url', protect, UploadController.getPresignedUrl);
router.all('/simulated-upload', UploadController.handleSimulatedUpload);

export default router;
