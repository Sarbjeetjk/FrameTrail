import { Router } from 'express';
import { ContactController } from '../controllers/contactController';

const router = Router();

// Public route to send contact message
router.post('/', ContactController.createMessage);

// Admin routes to view & manage contact messages in MongoDB Atlas
router.get('/', ContactController.getAllMessages);
router.patch('/:id/read', ContactController.markAsRead);
router.delete('/:id', ContactController.deleteMessage);

export default router;
