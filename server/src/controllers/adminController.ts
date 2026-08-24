import { Request, Response } from 'express';
import { Media } from '../models/Media';
import { HiddenCategory } from '../models/HiddenCategory';
import { R2Service } from '../services/r2Service';
import { sendResponse, sendError } from '../utils/response';
import mongoose from 'mongoose';

export class AdminController {
  /**
   * Admin: Create a new media item (after presigned R2 upload completes or direct URL)
   */
  static async createMedia(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        type,
        url,
        r2Key,
        category,
        tags,
        metadata,
        isFeatured,
      } = req.body;

      if (!title || !type || !url) {
        return sendError(res, 400, 'Title, type, and URL are required');
      }

      const media = await Media.create({
        title,
        description: description || '',
        type,
        url,
        r2Key: r2Key || '',
        category: category || 'General',
        tags: Array.isArray(tags) ? tags : [],
        metadata: metadata || {},
        isFeatured: Boolean(isFeatured),
      });

      return sendResponse(res, 201, true, 'Media created successfully', media);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error creating media');
    }
  }

  /**
   * Admin: Update media item details
   */
  static async updateMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const updatedMedia = await Media.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedMedia) {
        return sendError(res, 404, 'Media item not found');
      }

      return sendResponse(res, 200, true, 'Media updated successfully', updatedMedia);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error updating media');
    }
  }

  /**
   * Admin: Soft Delete media item (marks isDeleted: true in MongoDB Atlas)
   */
  static async deleteMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      return sendResponse(res, 200, true, 'Media moved to Trash Bin', { id });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error moving media to trash');
    }
  }

  /**
   * Admin: Restore soft-deleted media item back to active gallery
   */
  static async restoreMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true }
      );

      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      return sendResponse(res, 200, true, 'Media restored successfully', media);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error restoring media');
    }
  }

  /**
   * Admin: Purge media item permanently from MongoDB Atlas & R2 Storage
   */
  static async purgeMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findById(id);
      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      // Delete object from R2 storage if exists
      if (media.r2Key && !media.r2Key.startsWith('external_link')) {
        await R2Service.deleteObject(media.r2Key);
      }

      await Media.findByIdAndDelete(id);

      return sendResponse(res, 200, true, 'Media permanently purged from database', { id });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error purging media');
    }
  }

  /**
   * Admin: Toggle hide/unhide on an individual media item
   */
  static async toggleHideItem(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findById(id);
      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      media.isHidden = !media.isHidden;
      await media.save();

      return sendResponse(
        res,
        200,
        true,
        `Media asset ${media.isHidden ? 'hidden from' : 'restored to'} public gallery`,
        media
      );
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error toggling media privacy status');
    }
  }

  /**
   * Admin: Toggle hide/unhide on an entire Category / City
   */
  static async toggleHideCategory(req: Request, res: Response) {
    try {
      const { categoryName } = req.body;

      if (!categoryName) {
        return sendError(res, 400, 'Category name is required');
      }

      const existing = await HiddenCategory.findOne({ name: categoryName });
      if (existing) {
        await HiddenCategory.deleteOne({ _id: existing._id });
        return sendResponse(res, 200, true, `Category "${categoryName}" unhidden successfully`, {
          categoryName,
          hidden: false,
        });
      } else {
        await HiddenCategory.create({ name: categoryName });
        return sendResponse(res, 200, true, `Category "${categoryName}" and all its assets hidden from public gallery`, {
          categoryName,
          hidden: true,
        });
      }
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error toggling category privacy status');
    }
  }

  /**
   * Admin: Get all hidden media items & hidden categories list
   */
  static async getHiddenMedia(req: Request, res: Response) {
    try {
      const [hiddenItems, hiddenCategories] = await Promise.all([
        Media.find({ isHidden: true, isDeleted: { $ne: true } }).sort({ updatedAt: -1 }),
        HiddenCategory.find().sort({ createdAt: -1 }),
      ]);

      return sendResponse(res, 200, true, 'Hidden assets & categories retrieved', {
        hiddenItems,
        hiddenCategories: hiddenCategories.map((hc) => hc.name),
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching hidden media');
    }
  }

  /**
   * Admin: Get all soft-deleted items (Trash Bin)
   */
  static async getTrashedMedia(req: Request, res: Response) {
    try {
      const trashedItems = await Media.find({ isDeleted: true }).sort({ updatedAt: -1 });
      return sendResponse(res, 200, true, 'Trashed media retrieved successfully', trashedItems);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching trashed media');
    }
  }

  /**
   * Admin: Get all active media items for Admin CRUD Table (includes hidden items)
   */
  static async getAllAdminMedia(req: Request, res: Response) {
    try {
      const items = await Media.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
      return sendResponse(res, 200, true, 'All admin media items retrieved successfully', items);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching admin media items');
    }
  }

  /**
   * Admin: Dashboard system metrics & overview stats
   */
  static async getAdminStats(req: Request, res: Response) {
    try {
      const [photoCount, videoCount, movieCount, totalViews, totalLikes, recentItems] =
        await Promise.all([
          Media.countDocuments({ type: 'photo', isDeleted: { $ne: true } }),
          Media.countDocuments({ type: 'video', isDeleted: { $ne: true } }),
          Media.countDocuments({ type: 'movie', isDeleted: { $ne: true } }),
          Media.aggregate([{ $match: { isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: '$views' } } }]),
          Media.aggregate([{ $match: { isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: '$likes' } } }]),
          Media.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(10),
        ]);

      const stats = {
        totalPhotos: photoCount,
        totalVideos: videoCount,
        totalMovies: movieCount,
        totalMediaCount: photoCount + videoCount + movieCount,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        recentItems,
      };

      return sendResponse(res, 200, true, 'Admin statistics loaded', stats);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error loading stats');
    }
  }
}
