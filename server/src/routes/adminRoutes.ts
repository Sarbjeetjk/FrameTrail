import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Apply protect & adminOnly middleware to all admin endpoints
router.use(protect, adminOnly);

router.get('/stats', AdminController.getAdminStats);
router.get('/trash', AdminController.getTrashedMedia);
router.get('/hidden', AdminController.getHiddenMedia);
router.get('/all-media', AdminController.getAllAdminMedia);
router.post('/media', AdminController.createMedia);
router.put('/media/:id', AdminController.updateMedia);
router.patch('/media/:id/hide', AdminController.toggleHideItem);
router.post('/categories/hide', AdminController.toggleHideCategory);
router.put('/media/:id/restore', AdminController.restoreMedia);
router.delete('/media/:id', AdminController.deleteMedia);
router.delete('/media/:id/purge', AdminController.purgeMedia);

export default router;
