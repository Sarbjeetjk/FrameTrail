import React, { createContext, useState, ReactNode } from 'react';
import { IMediaItem, MediaType, IPagination } from '../types';
import { MediaService, GetMediaParams } from '../services/mediaService';

interface MediaContextType {
  mediaItems: IMediaItem[];
  pagination: IPagination | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  activeType: MediaType | 'all';
  setActiveType: (type: MediaType | 'all') => void;
  fetchMedia: (params?: GetMediaParams) => Promise<void>;
  likeMediaItem: (id: string) => Promise<void>;
  userLikedIds: string[];
}

export const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mediaItems, setMediaItems] = useState<IMediaItem[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [activeType, setActiveType] = useState<MediaType | 'all'>('all');

  // Track liked IDs in persistent state
  const [userLikedIds, setUserLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('frametrail_user_likes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const isFetchingRef = React.useRef(false);

  const fetchMedia = async (params: GetMediaParams = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const typeParam = activeType === 'all' ? undefined : activeType;
      const res = await MediaService.getMedia({
        search: searchQuery || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        sortBy,
        type: typeParam,
        ...params,
      });

      if (res.success && res.data) {
        setMediaItems(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load media gallery items');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const likeMediaItem = async (id: string) => {
    // 1. Check if user is logged in using correct localStorage keys
    const token = localStorage.getItem('frametrail_token') || localStorage.getItem('token');
    const user = localStorage.getItem('frametrail_user') || localStorage.getItem('user');
    if (!token && !user) {
      // Redirect to login page with banner indicator only if user is truly NOT logged in
      window.location.href = '/login?redirect=like';
      return;
    }

    const isAlreadyLiked = userLikedIds.includes(id);

    if (isAlreadyLiked) {
      // 💔 UNLIKE ACTION: Remove from liked list & decrement count
      const updatedLikes = userLikedIds.filter((likedId) => likedId !== id);
      setUserLikedIds(updatedLikes);
      localStorage.setItem('frametrail_user_likes', JSON.stringify(updatedLikes));

      setMediaItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, likes: Math.max(0, item.likes - 1) } : item
        )
      );
    } else {
      // ❤️ LIKE ACTION: Add to liked list & increment count
      const updatedLikes = [...userLikedIds, id];
      setUserLikedIds(updatedLikes);
      localStorage.setItem('frametrail_user_likes', JSON.stringify(updatedLikes));

      setMediaItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, likes: item.likes + 1 } : item
        )
      );

      try {
        await MediaService.likeMedia(id);
      } catch (err) {
        console.error('[Like Error]', err);
      }
    }
  };

  return (
    <MediaContext.Provider
      value={{
        mediaItems,
        pagination,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        activeType,
        setActiveType,
        fetchMedia,
        likeMediaItem,
        userLikedIds,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
