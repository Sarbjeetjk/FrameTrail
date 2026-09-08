import { Request, Response } from 'express';
import { Media, MediaType } from '../models/Media';
import { HiddenCategory } from '../models/HiddenCategory';
import { User } from '../models/User';
import { sendResponse, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { recordActivityLog } from '../utils/activityLogger';
import mongoose from 'mongoose';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MediaController {
  /**
   * Get paginated media items with advanced search & filters (hides deleted, hidden items & hidden categories)
   * Ensures private uploads of other users are not exposed publicly.
   */
  static async getMedia(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 24;
      const type = req.query.type as MediaType | undefined;
      const category = req.query.category as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.search as string | undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const featured = req.query.featured === 'true';
      const mySpaceOnly = req.query.mySpace === 'true';

      // Fetch all hidden categories from MongoDB Atlas
      const hiddenCats = await HiddenCategory.find();
      const hiddenCatNames = hiddenCats.map((hc) => hc.name);

      const filter: any = {
        isDeleted: { $ne: true },
        isHidden: { $ne: true },
      };

      if (hiddenCatNames.length > 0) {
        filter.category = { $nin: hiddenCatNames };
      }

      // 🔒 Privacy Isolation:
      // Regular users' private uploads must NOT be visible to others.
      if (mySpaceOnly && req.user) {
        // Only this user's uploads
        filter.uploadedBy = req.user.id;
      } else {
        // Public browsing: Only admin/system uploads (uploadedBy null or admin) OR this logged-in user's uploads
        const regularUsers = await User.find({ role: 'user' }).select('_id');
        const regularUserIds = regularUsers.map((u) => u._id.toString());
        
        // Exclude other regular users' uploads
        const currentUserId = req.user ? req.user.id : null;
        const otherUserIds = regularUserIds.filter((id) => id !== currentUserId);

        if (otherUserIds.length > 0) {
          filter.uploadedBy = { $nin: otherUserIds };
        }
      }

      // Apply type filter only if user explicitly selects type without search query
      if (type && (type as string) !== 'all' && !search) {
        filter.type = type;
      }

      if (category && category !== 'All') {
        filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
      }

      if (tag) {
        filter.tags = tag.toLowerCase();
      }

      if (featured) {
        filter.isFeatured = true;
      }

      // 🔍 GLOBAL FUZZY SEARCH (Searches across Title, Description, Category, Tags & Type)
      if (search && search.trim()) {
        const safeSearch = escapeRegex(search.trim());
        const keywords = safeSearch.split(/\s+/).filter(Boolean);

        const searchConditions = keywords.flatMap((kw) => {
          const kwRegex = new RegExp(kw, 'i');
          return [
            { title: { $regex: kwRegex } },
            { description: { $regex: kwRegex } },
            { category: { $regex: kwRegex } },
            { tags: { $in: [kwRegex] } },
            { type: { $regex: kwRegex } },
          ];
        });

        filter.$or = searchConditions;
      }

      const skip = (page - 1) * limit;

      const sortOption: any = {};
      if (sortBy === 'popular' || sortBy === 'views') {
        sortOption.views = -1;
      } else if (sortBy === 'likes') {
        sortOption.likes = -1;
      } else if (sortBy === 'rating') {
        sortOption['metadata.rating'] = -1;
      } else {
        sortOption[sortBy] = sortOrder;
      }

      const [items, total] = await Promise.all([
        Media.find(filter).sort(sortOption).skip(skip).limit(limit),
        Media.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return sendResponse(
        res,
        200,
        true,
        'Media items retrieved successfully',
        items,
        {
          page,
          limit,
          total,
          totalPages,
        }
      );
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to fetch media');
    }
  }

  /**
   * Get single media item details and increment view count
   */
  static async getMediaById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const mediaDoc = await Media.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );

      if (!mediaDoc) {
        return sendError(res, 404, 'Media item not found');
      }

      const media: any = mediaDoc.toObject();

      // Enrich uploader information
      let uploaderInfo: any = { name: 'Admin / System', role: 'admin' };
      const rawUploadedBy = media.uploadedBy;
      const rawId = typeof rawUploadedBy === 'object' && rawUploadedBy ? (rawUploadedBy._id || rawUploadedBy.id) : rawUploadedBy;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId.toString())) {
        const u = await User.findById(rawId).select('_id name email role avatar').lean();
        if (u) {
          uploaderInfo = {
            _id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
          };
        }
      }
      media.uploadedBy = uploaderInfo;

      return sendResponse(res, 200, true, 'Media detail retrieved', media);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching media details');
    }
  }

  /**
   * Like a media item
   */
  static async likeMedia(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, 400, 'Invalid media ID format');
      }

      const media = await Media.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

      return sendResponse(res, 200, true, 'Liked media item', { likes: media.likes });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error liking media');
    }
  }

  /**
   * Get Category summary stats (dynamic by media type & excluding hidden categories)
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const { type } = req.query;

      const hiddenCats = await HiddenCategory.find();
      const hiddenCatNames = hiddenCats.map((hc) => hc.name);

      const matchStage: any = {
        isDeleted: { $ne: true },
        isHidden: { $ne: true },
      };

      if (type && type !== 'all') {
        matchStage.type = type;
      }

      if (hiddenCatNames.length > 0) {
        matchStage.category = { $nin: hiddenCatNames };
      }

      const categories = await Media.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $match: { _id: { $nin: [null, ''] }, count: { $gt: 0 } } },
        { $sort: { count: -1 } },
      ]);

      return sendResponse(res, 200, true, 'Categories fetched', categories);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error fetching categories');
    }
  }

  /**
   * User: Upload media to personal space with strict quota check (100 Photos, 10 Videos default)
   */
  static async createUserUpload(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { title, description, type, url, r2Key, category, tags, metadata } = req.body;

      if (!title || !type || !url) {
        return sendError(res, 400, 'Title, type, and URL are required');
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      // Check quota limits for regular users
      if (user.role !== 'admin') {
        const maxPhotos = user.uploadLimits?.maxPhotos ?? 100;
        const maxVideos = user.uploadLimits?.maxVideos ?? 10;

        if (type === 'photo') {
          const currentPhotos = await Media.countDocuments({
            uploadedBy: req.user.id,
            type: 'photo',
            isDeleted: { $ne: true },
          });

          if (currentPhotos >= maxPhotos) {
            return sendError(
              res,
              400,
              `Photo upload limit reached! You have uploaded ${currentPhotos} / ${maxPhotos} photos. Please delete existing photos or contact Admin to increase your limit.`
            );
          }
        } else if (type === 'video' || type === 'movie') {
          const currentVideos = await Media.countDocuments({
            uploadedBy: req.user.id,
            type: { $in: ['video', 'movie'] },
            isDeleted: { $ne: true },
          });

          if (currentVideos >= maxVideos) {
            return sendError(
              res,
              400,
              `Video upload limit reached! You have uploaded ${currentVideos} / ${maxVideos} videos. Please delete existing videos or contact Admin to increase your limit.`
            );
          }
        }
      }

      const media = await Media.create({
        title,
        description: description || '',
        type,
        url,
        r2Key: r2Key || '',
        category: category || 'Personal',
        tags: Array.isArray(tags) ? tags : [],
        metadata: metadata || {},
        isFeatured: false,
        uploadedBy: req.user.id,
      });

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      recordActivityLog(req, {
        event: 'MEDIA_UPLOADED',
        detail: `User "${user.name}" (${user.email}) published new ${(type || 'photo').toUpperCase()} asset "${media.title}" in Category "${media.category || 'Personal'}".`,
        level: 'success',
        user: user.name,
        userId: user._id,
        userEmail: user.email,
        userRole: user.role,
        metadata: {
          mediaId: media._id.toString(),
          mediaTitle: media.title,
          mediaType: media.type,
          category: media.category,
          url: media.url,
        },
      });

      return sendResponse(res, 201, true, 'Media uploaded to your personal space successfully', media);
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error creating user upload');
    }
  }

  /**
   * User: Get personal space overview & quota usage
   */
  static async getMySpace(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      const isAdmin = user.role === 'admin';
      const maxPhotos = isAdmin ? 999999 : (user.uploadLimits?.maxPhotos ?? 100);
      const maxVideos = isAdmin ? 999999 : (user.uploadLimits?.maxVideos ?? 10);

      const [usedPhotos, usedVideos, userItems] = await Promise.all([
        Media.countDocuments({
          uploadedBy: req.user.id,
          type: 'photo',
          isDeleted: { $ne: true },
        }),
        Media.countDocuments({
          uploadedBy: req.user.id,
          type: { $in: ['video', 'movie'] },
          isDeleted: { $ne: true },
        }),
        Media.find({
          uploadedBy: req.user.id,
          isDeleted: { $ne: true },
        }).sort({ createdAt: -1 }),
      ]);

      return sendResponse(res, 200, true, 'Personal space retrieved', {
        quota: {
          isAdmin,
          isUnlimited: isAdmin,
          maxPhotos,
          usedPhotos,
          maxVideos,
          usedVideos,
          availablePhotos: isAdmin ? 999999 : Math.max(0, maxPhotos - usedPhotos),
          availableVideos: isAdmin ? 999999 : Math.max(0, maxVideos - usedVideos),
        },
        items: userItems,
      });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error retrieving personal space');
    }
  }

  /**
   * User: Delete own media item (frees up quota)
   */
  static async deleteMyMedia(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 401, 'Unauthorized');
      }

      const { id } = req.params;
      const media = await Media.findOne({
        _id: id,
        uploadedBy: req.user.id,
      });

      if (!media) {
        return sendError(res, 404, 'Media item not found or you do not have permission to delete it');
      }

      media.isDeleted = true;
      await media.save();

      // 📝 Record Centralized System Activity Audit Log in MongoDB
      const user = await User.findById(req.user.id);
      recordActivityLog(req, {
        event: 'MEDIA_DELETED',
        detail: `User "${user?.name || req.user.email || 'User'}" deleted ${(media.type || 'media').toUpperCase()} asset "${media.title}".`,
        level: 'warn',
        user: user?.name || req.user.email || 'User',
        userId: req.user.id,
        userEmail: user?.email || req.user.email || '',
        userRole: 'user',
        metadata: {
          mediaId: media._id.toString(),
          mediaTitle: media.title,
          mediaType: media.type,
        },
      });

      return sendResponse(res, 200, true, 'Media removed from personal space successfully', { id });
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Error deleting personal media');
    }
  }
}
