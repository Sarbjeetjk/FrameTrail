import { api } from './api';
import { ApiResponse, IMediaItem, MediaType, AdminStats } from '../types';

export interface GetMediaParams {
  page?: number;
  limit?: number;
  type?: MediaType;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

export class MediaService {
  static async getMedia(params: GetMediaParams = {}): Promise<ApiResponse<IMediaItem[]>> {
    const response = await api.get('/media', { params });
    return response.data;
  }

  static async getMediaById(id: string): Promise<ApiResponse<IMediaItem>> {
    const response = await api.get(`/media/${id}`);
    return response.data;
  }

  static async likeMedia(id: string): Promise<ApiResponse<{ likes: number }>> {
    const response = await api.post(`/media/${id}/like`);
    return response.data;
  }

  static async getCategories(type?: string): Promise<ApiResponse<{ _id: string; count: number }[]>> {
    const response = await api.get('/media/categories', { params: type ? { type } : undefined });
    return response.data;
  }

  // Admin Operations
  static async createMedia(mediaData: Partial<IMediaItem>): Promise<ApiResponse<IMediaItem>> {
    const response = await api.post('/admin/media', mediaData);
    return response.data;
  }

  static async updateMedia(id: string, mediaData: Partial<IMediaItem>): Promise<ApiResponse<IMediaItem>> {
    const response = await api.put(`/admin/media/${id}`, mediaData);
    return response.data;
  }

  static async deleteMedia(id: string): Promise<ApiResponse<{ id: string }>> {
    const response = await api.delete(`/admin/media/${id}`);
    return response.data;
  }

  static async getTrashedMedia(): Promise<ApiResponse<IMediaItem[]>> {
    const response = await api.get('/admin/trash');
    return response.data;
  }

  static async getAllAdminMedia(): Promise<ApiResponse<IMediaItem[]>> {
    const response = await api.get('/admin/all-media');
    return response.data;
  }

  static async getHiddenMedia(): Promise<ApiResponse<{ hiddenItems: IMediaItem[]; hiddenCategories: string[] }>> {
    const response = await api.get('/admin/hidden');
    return response.data;
  }

  static async toggleHideItem(id: string): Promise<ApiResponse<IMediaItem>> {
    const response = await api.patch(`/admin/media/${id}/hide`);
    return response.data;
  }

  static async toggleHideCategory(categoryName: string): Promise<ApiResponse<{ categoryName: string; hidden: boolean }>> {
    const response = await api.post('/admin/categories/hide', { categoryName });
    return response.data;
  }

  static async restoreMedia(id: string): Promise<ApiResponse<IMediaItem>> {
    const response = await api.put(`/admin/media/${id}/restore`);
    return response.data;
  }

  static async purgeMedia(id: string): Promise<ApiResponse<{ id: string }>> {
    const response = await api.delete(`/admin/media/${id}/purge`);
    return response.data;
  }

  static async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    const response = await api.get('/admin/stats');
    return response.data;
  }
}
