import { Router } from 'express';
import { MediaController } from '../controllers/mediaController';

const router = Router();

router.get('/', MediaController.getMedia);
router.get('/categories', MediaController.getCategories);
router.get('/:id', MediaController.getMediaById);
router.post('/:id/like', MediaController.likeMedia);

export default router;
