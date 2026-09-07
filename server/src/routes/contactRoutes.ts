import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public route to send contact message
router.post('/', ContactController.createMessage);

// Admin-Only routes to view & manage contact messages in MongoDB Atlas
router.get('/', protect, adminOnly, ContactController.getAllMessages);
router.patch('/:id/read', protect, adminOnly, ContactController.markAsRead);
router.delete('/:id', protect, adminOnly, ContactController.deleteMessage);

export default router;
