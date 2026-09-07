import { Router } from 'express';
import { MediaController } from '../controllers/mediaController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Public / Protected Media Endpoints
router.get('/', optionalAuth, MediaController.getMedia);
router.get('/categories', MediaController.getCategories);
router.get('/my-space', protect, MediaController.getMySpace);
router.post('/user-upload', protect, MediaController.createUserUpload);
router.delete('/my-space/:id', protect, MediaController.deleteMyMedia);
router.get('/:id', MediaController.getMediaById);
router.post('/:id/like', MediaController.likeMedia);

export default router;
