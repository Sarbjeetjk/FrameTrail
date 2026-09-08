import { Request, Response } from 'express';
import { Media } from '../models/Media';
import { HiddenCategory } from '../models/HiddenCategory';
import { User } from '../models/User';
import { R2Service } from '../services/r2Service';
import { sendResponse, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ActivityLog } from '../models/ActivityLog';
import { recordActivityLog, backfillHistoricalLogs } from '../utils/activityLogger';
import mongoose from 'mongoose';

async function enrichMediaWithUser(items: any[]) {
  if (!items || items.length === 0) return items;

  const userIds = Array.from(
    new Set(
      items
        .map((i) => (typeof i.uploadedBy === 'object' && i.uploadedBy ? i.uploadedBy._id || i.uploadedBy.id : i.uploadedBy))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id.toString()))
        .map((id) => id.toString())
    )
  );

  let userMap = new Map<string, any>();
  if (userIds.length > 0) {
    const users = await User.find({ _id: { $in: userIds } }).select('_id name email role avatar').lean();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
      });
    });
  }

  return items.map((item) => {
    const itemObj = item.toObject ? item.toObject() : { ...item };
    const rawId = typeof itemObj.uploadedBy === 'object' && itemObj.uploadedBy ? (itemObj.uploadedBy._id || itemObj.uploadedBy.id)?.toString() : itemObj.uploadedBy?.toString();
    if (rawId && userMap.has(rawId)) {
      itemObj.uploadedBy = userMap.get(rawId);
    } else if (!itemObj.uploadedBy) {
      itemObj.uploadedBy = { name: 'Admin / System', role: 'admin' };
    }
    return itemObj;
  });
}

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

      const authUser = (req as AuthenticatedRequest).user;

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
        uploadedBy: authUser?.id,
      });

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_UPLOADED',
        detail: `Admin published new ${(type || 'photo').toUpperCase()} asset "${media.title}" in Category "${media.category || 'General'}".`,
        level: 'success',
        metadata: {
          mediaId: media._id.toString(),
          mediaTitle: media.title,
          mediaType: media.type,
          category: media.category,
          url: media.url,
        },
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

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_TRASHED',
        detail: `Admin moved ${(media.type || 'media').toUpperCase()} asset "${media.title}" to Trash Bin.`,
        level: 'warn',
        metadata: { mediaId: media._id.toString(), mediaTitle: media.title, mediaType: media.type },
      });

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

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_RESTORED',
        detail: `Admin restored ${(media.type || 'media').toUpperCase()} asset "${media.title}" from Trash Bin back to active gallery.`,
        level: 'success',
        metadata: { mediaId: media._id.toString(), mediaTitle: media.title, mediaType: media.type },
      });

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

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_PURGED',
        detail: `Admin permanently purged ${(media.type || 'media').toUpperCase()} asset "${media.title}" from database & Cloudinary/R2 storage.`,
        level: 'error',
        metadata: { mediaId: media._id.toString(), mediaTitle: media.title, mediaType: media.type },
      });

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

      const enrichedHiddenItems = await enrichMediaWithUser(hiddenItems);

      return sendResponse(res, 200, true, 'Hidden assets & categories retrieved', {
        hiddenItems: enrichedHiddenItems,
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
      const enrichedTrashedItems = await enrichMediaWithUser(trashedItems);
      return sendResponse(res, 200, true, 'Trashed media retrieved successfully', enrichedTrashedItems);
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
      const enrichedItems = await enrichMediaWithUser(items);
      return sendResponse(res, 200, true, 'All admin media items retrieved successfully', enrichedItems);
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

  /**
   * Admin: Get all user spaces with upload statistics & uploaded items
   */
  static async getUserSpaces(req: Request, res: Response) {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });

      const usersWithSpaces = await Promise.all(
        users.map(async (u) => {
          const userIdStr = u._id.toString();
          const [photoCount, videoCount, items] = await Promise.all([
            Media.countDocuments({
              uploadedBy: { $in: [u._id, userIdStr] },
              type: 'photo',
              isDeleted: { $ne: true },
            }),
            Media.countDocuments({
              uploadedBy: { $in: [u._id, userIdStr] },
              type: { $in: ['video', 'movie'] },
              isDeleted: { $ne: true },
            }),
            Media.find({
              uploadedBy: { $in: [u._id, userIdStr] },
              isDeleted: { $ne: true },
            }).sort({ createdAt: -1 }),
          ]);

          const isUserAdmin = u.role === 'admin';
          const maxPhotos = isUserAdmin ? 999999 : (u.uploadLimits?.maxPhotos ?? 100);
          const maxVideos = isUserAdmin ? 999999 : (u.uploadLimits?.maxVideos ?? 10);

          return {
            user: {
              id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar,
              status: u.status || 'active',
              blockReason: u.blockReason || '',
              uploadLimits: {
                maxPhotos,
                maxVideos,
              },
              createdAt: u.createdAt,
            },
            stats: {
              isUnlimited: isUserAdmin,
              photoCount,
              videoCount,
              maxPhotos,
              maxVideos,
              totalItems: items.length,
              lastUploadAt: items.length > 0 ? items[0].createdAt : null,
            },
            items,
          };
        })
      );

      return sendResponse(res, 200, true, 'User spaces retrieved successfully', usersWithSpaces);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch user spaces');
    }
  }

  /**
   * Admin: Update upload limits / quota for a specific user
   */
  static async updateUserQuota(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { maxPhotos, maxVideos } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return sendError(res, 400, 'Invalid user ID format');
      }

      const user = await User.findById(userId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      if (user.role === 'admin') {
        return sendError(res, 400, 'Administrator accounts have unlimited storage and do not require quota restrictions.');
      }

      if (maxPhotos !== undefined) {
        user.uploadLimits.maxPhotos = Math.max(0, parseInt(maxPhotos) || 100);
      }
      if (maxVideos !== undefined) {
        user.uploadLimits.maxVideos = Math.max(0, parseInt(maxVideos) || 10);
      }

      await user.save();

      return sendResponse(res, 200, true, `Quota limits updated for ${user.name}`, {
        userId: user._id,
        uploadLimits: user.uploadLimits,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to update user quota');
    }
  }

  /**
   * Admin: Update user status (active, blocked, deactivated) for anti-spam management
   */
  static async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, blockReason } = req.body;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return sendError(res, 400, 'Invalid user ID format');
      }

      if (!['active', 'blocked', 'deactivated'].includes(status)) {
        return sendError(res, 400, 'Status must be one of: active, blocked, deactivated');
      }

      const user = await User.findById(userId);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      if (user.role === 'admin' && status !== 'active') {
        return sendError(res, 403, 'Admin accounts cannot be blocked or deactivated');
      }

      user.status = status;
      if (blockReason !== undefined) {
        user.blockReason = blockReason;
      }

      await user.save();

      const statusLabels: Record<string, string> = {
        active: 'Account activated',
        blocked: 'Account blocked due to spam/policy violation',
        deactivated: 'Account temporarily deactivated',
      };

      return sendResponse(res, 200, true, `${user.name}: ${statusLabels[status]}`, {
        userId: user._id,
        status: user.status,
        blockReason: user.blockReason,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to update user status');
    }
  }

  /**
   * Admin: Moderate / delete a user-uploaded media item
   */
  static async deleteUserMedia(req: Request, res: Response) {
    try {
      const { mediaId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(mediaId)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findById(mediaId);
      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      media.isDeleted = true;
      await media.save();

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_MODERATED_DELETE',
        detail: `Admin moderated and deleted user media asset "${media.title}" (${media.type}).`,
        level: 'warn',
        metadata: { mediaId: media._id.toString(), mediaTitle: media.title, mediaType: media.type },
      });

      return sendResponse(res, 200, true, 'User media asset deleted successfully', { id: mediaId });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to delete user media');
    }
  }

  /**
   * Admin: Permanently delete a user account and ALL their uploaded media data with Admin Password verification
   */
  static async purgeUserAccount(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { userId } = req.params;
      const { adminPassword } = req.body;

      if (!adminPassword || !adminPassword.trim()) {
        return sendError(res, 400, 'Admin password is required to permanently delete an account');
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return sendError(res, 400, 'Invalid user ID format');
      }

      // Verify Admin's own password
      const adminUser = await User.findById(req.user.id).select('+password');
      if (!adminUser) {
        return sendError(res, 404, 'Admin user account not found');
      }

      const isMatch = await adminUser.comparePassword(adminPassword.trim());
      if (!isMatch) {
        return sendError(res, 401, 'Incorrect admin password! Permanent deletion aborted.');
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return sendError(res, 404, 'User not found or already deleted');
      }

      if (targetUser.role === 'admin') {
        return sendError(res, 403, 'Administrator accounts cannot be permanently deleted');
      }

      // Purge all media uploaded by this user
      const deletedMediaResult = await Media.deleteMany({
        uploadedBy: { $in: [userId, targetUser._id, targetUser._id.toString()] },
      });

      // Permanently delete user document
      await User.findByIdAndDelete(userId);

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'USER_ACCOUNT_PURGED',
        detail: `Admin permanently deleted account "${targetUser.name}" (${targetUser.email}) and all ${deletedMediaResult.deletedCount} associated media assets.`,
        level: 'error',
        metadata: { userId, userName: targetUser.name, userEmail: targetUser.email, deletedMediaCount: deletedMediaResult.deletedCount },
      });

      return sendResponse(
        res,
        200,
        true,
        `Account for "${targetUser.name}" and all ${deletedMediaResult.deletedCount} associated media assets permanently deleted from database.`,
        { userId, deletedMediaCount: deletedMediaResult.deletedCount }
      );
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to permanently delete user account');
    }
  }

  /**
   * Admin: Get all activity logs from MongoDB (Active vs Trashed Archive)
   */
  static async getLogs(req: AuthenticatedRequest, res: Response) {
    try {
      // Auto backfill historical logs if needed in background
      const totalCount = await ActivityLog.countDocuments();
      if (totalCount < 5) {
        await backfillHistoricalLogs();
      }

      const { tab } = req.query;
      const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      let query: any = {};
      if (tab === 'trash') {
        // Logs older than 30 days OR explicitly archived
        query = {
          $or: [{ isArchived: true }, { createdAt: { $lt: THIRTY_DAYS_AGO } }],
        };
      } else {
        // Active logs: within 30 days and not archived
        query = {
          isArchived: { $ne: true },
          createdAt: { $gte: THIRTY_DAYS_AGO },
        };
      }

      const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(150);

      const formatted = logs.map((l) => ({
        id: l._id.toString(),
        timestamp: new Date(l.createdAt).getTime(),
        time: 'Just now',
        event: l.event,
        user: l.user,
        userEmail: l.userEmail,
        userRole: l.userRole,
        detail: l.detail,
        level: l.level,
        ip: l.ip,
        location: l.location,
        coordinates: l.coordinates,
        device: l.device,
        isp: l.isp,
        networkType: l.networkType,
        screenRes: l.screenRes,
        timezone: l.timezone,
        hardwareSpec: l.hardwareSpec,
        isArchived: l.isArchived,
        createdAt: l.createdAt,
      }));

      return sendResponse(res, 200, true, 'Activity logs fetched successfully', formatted);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch activity logs');
    }
  }

  /**
   * Admin: Delete a single log entry from MongoDB
   */
  static async deleteSingleLog(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return sendError(res, 400, 'Log ID is required');
      }

      if (mongoose.Types.ObjectId.isValid(id)) {
        await ActivityLog.findByIdAndDelete(id);
      } else {
        await ActivityLog.deleteOne({ _id: id });
      }

      return sendResponse(res, 200, true, 'Activity log entry permanently deleted', { id });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to delete activity log');
    }
  }

  /**
   * Admin: Clear / Purge logs with Admin Password Verification
   */
  static async clearLogs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { password, tab } = req.body;
      if (!password || !password.trim()) {
        return sendError(res, 400, 'Admin password is required to clear activity logs');
      }

      // Verify Admin Password
      const adminUser = await User.findById(req.user.id).select('+password');
      if (!adminUser) {
        return sendError(res, 404, 'Admin account not found');
      }

      const isMatch = await adminUser.comparePassword(password.trim());
      if (!isMatch) {
        return sendError(res, 401, 'Incorrect admin password! Log purge denied.');
      }

      const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (tab === 'trash') {
        // Permanently purge trash archive
        await ActivityLog.deleteMany({
          $or: [{ isArchived: true }, { createdAt: { $lt: THIRTY_DAYS_AGO } }],
        });
      } else {
        // Move active logs to archive instead of completely losing audit trail
        await ActivityLog.updateMany(
          { isArchived: { $ne: true } },
          { $set: { isArchived: true, archivedAt: new Date() } }
        );
      }

      return sendResponse(res, 200, true, 'System activity logs cleared successfully');
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to clear activity logs');
    }
  }

  /**
   * Admin: Restore an archived/trashed log entry back to active stream
   */
  static async restoreLog(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return sendError(res, 400, 'Log ID is required');
      }

      const log = await ActivityLog.findById(id);
      if (!log) {
        return sendError(res, 404, 'Activity log entry not found');
      }

      log.isArchived = false;
      log.createdAt = new Date();
      await log.save();

      return sendResponse(res, 200, true, 'Activity log restored to active stream successfully', log);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to restore activity log');
    }
  }

  /**
   * Client Telemetry API: Allows client applications to submit user actions directly into MongoDB
   */
  static async createClientLog(req: Request, res: Response) {
    try {
      const { event, detail, level, user, location, coordinates, device } = req.body;
      if (!event || !detail) {
        return sendError(res, 400, 'Event and detail are required');
      }

      const log = await recordActivityLog(req, {
        event,
        detail,
        level: level || 'info',
        user,
        location,
        coordinates,
        device,
      });

      return sendResponse(res, 201, true, 'Activity log recorded in MongoDB Atlas', log);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to record activity log');
    }
  }
}
