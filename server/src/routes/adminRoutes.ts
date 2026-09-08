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
router.get('/user-spaces', AdminController.getUserSpaces);
router.put('/user-spaces/:userId/limits', AdminController.updateUserQuota);
router.put('/user-spaces/:userId/status', AdminController.updateUserStatus);
router.delete('/user-spaces/media/:mediaId', AdminController.deleteUserMedia);
router.delete('/user-spaces/:userId/purge', AdminController.purgeUserAccount);
router.post('/media', AdminController.createMedia);
router.put('/media/:id', AdminController.updateMedia);
router.patch('/media/:id/hide', AdminController.toggleHideItem);
router.post('/categories/hide', AdminController.toggleHideCategory);
router.put('/media/:id/restore', AdminController.restoreMedia);
router.delete('/media/:id', AdminController.deleteMedia);
router.delete('/media/:id/purge', AdminController.purgeMedia);

// Activity Logs Management Routes
router.get('/logs', AdminController.getLogs);
router.delete('/logs/:id', AdminController.deleteSingleLog);
router.post('/logs/clear', AdminController.clearLogs);
router.put('/logs/:id/restore', AdminController.restoreLog);

export default router;
