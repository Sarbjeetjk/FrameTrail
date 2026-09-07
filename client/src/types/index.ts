export type MediaType = 'photo' | 'video' | 'movie';

export interface IMediaMetadata {
  resolution?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  releaseYear?: number;
  rating?: number;
  director?: string;
  cast?: string[];
  thumbnailUrl?: string;
}

export interface IMediaItem {
  _id: string;
  title: string;
  description: string;
  type: MediaType;
  url: string;
  r2Key?: string;
  category: string;
  tags: string[];
  metadata: IMediaMetadata;
  views: number;
  likes: number;
  isFeatured: boolean;
  isDeleted?: boolean;
  isHidden?: boolean;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  uploadLimits?: {
    maxPhotos: number;
    maxVideos: number;
  };
  status?: 'active' | 'blocked' | 'deactivated';
  blockReason?: string;
  createdAt?: string;
}

export interface UserSpaceQuota {
  isUnlimited?: boolean;
  maxPhotos: number;
  usedPhotos: number;
  maxVideos: number;
  usedVideos: number;
  availablePhotos: number;
  availableVideos: number;
}

export interface UserSpaceData {
  user: IUser;
  stats: {
    isUnlimited?: boolean;
    photoCount: number;
    videoCount: number;
    maxPhotos: number;
    maxVideos: number;
    totalItems: number;
    lastUploadAt?: string | null;
  };
  items: IMediaItem[];
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: IPagination;
  error?: any;
}

export interface AdminStats {
  totalPhotos: number;
  totalVideos: number;
  totalMovies: number;
  totalMediaCount: number;
  totalViews: number;
  totalLikes: number;
  recentItems: IMediaItem[];
}
