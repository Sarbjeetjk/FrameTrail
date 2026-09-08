import { Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { sendResponse, sendError } from '../utils/response';
import { sendContactInquiryNotification } from '../utils/sendgrid';

export class ContactController {
  /**
   * Public: Submit a new contact inquiry message into MongoDB Atlas
   */
  static async createMessage(req: Request, res: Response) {
    try {
      const { name, email, category, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return sendError(res, 400, 'Name, email, subject, and message are required fields');
      }

      const newMessage = await ContactMessage.create({
        name,
        email,
        category: category || 'General Inquiry',
        subject,
        message,
        read: false,
      });

      console.log(`[Contact DB] New contact message stored in MongoDB Atlas from ${email}`);

      // 📧 Send Instant Email Alert to Admin Email ID (sarbjeetkumar76350@gmail.com)
      sendContactInquiryNotification({
        name,
        email,
        category: category || 'General Inquiry',
        subject,
        message,
      }).catch((mailErr) => {
        console.error('[Contact Mail Background Error]', mailErr);
      });

      return sendResponse(res, 201, true, 'Contact message submitted successfully to MongoDB Atlas', newMessage);
    } catch (error: any) {
      console.error('[Contact Create Error]', error);
      return sendError(res, 500, error.message || 'Failed to submit contact message');
    }
  }

  /**
   * Admin: Get all contact messages from MongoDB Atlas
   */
  static async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await ContactMessage.find().sort({ createdAt: -1 });
      return sendResponse(res, 200, true, 'Contact messages retrieved from MongoDB Atlas', messages);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch contact messages');
    }
  }

  /**
   * Admin: Mark message as read in MongoDB Atlas
   */
  static async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ContactMessage.findByIdAndUpdate(id, { read: true }, { new: true });
      if (!updated) {
        return sendError(res, 404, 'Contact message not found');
      }
      return sendResponse(res, 200, true, 'Message marked as read', updated);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to update message');
    }
  }

  /**
   * Admin: Delete message from MongoDB Atlas
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ContactMessage.findByIdAndDelete(id);
      if (!deleted) {
        return sendError(res, 404, 'Contact message not found');
      }
      return sendResponse(res, 200, true, 'Message deleted from MongoDB Atlas', { id });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to delete message');
    }
  }
}
