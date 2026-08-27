import { Request, Response } from 'express';
import { Media, MediaType } from '../models/Media';
import { HiddenCategory } from '../models/HiddenCategory';
import { sendResponse, sendError } from '../utils/response';
import mongoose from 'mongoose';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class MediaController {
  /**
   * Get paginated media items with advanced search & filters (hides deleted, hidden items & hidden categories)
   */
  static async getMedia(req: Request, res: Response) {
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

      const media = await Media.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );

      if (!media) {
        return sendError(res, 404, 'Media item not found');
      }

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
}
