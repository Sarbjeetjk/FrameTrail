import React from 'react';
import { IMediaItem } from '../types';
import { Heart, Maximize2, Play, Film, Video } from 'lucide-react';
import { useMedia } from '../hooks/useMedia';

interface MediaCardProps {
  item: IMediaItem;
  onSelect?: (item: IMediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onSelect }) => {
  const { likeMediaItem, userLikedIds } = useMedia();
  const isLiked = userLikedIds.includes(item._id);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeMediaItem(item._id);
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeId = (url: string) => {
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (url.includes('watch?v=')) {
      return url.split('watch?v=')[1]?.split('&')[0];
    }
    return null;
  };

  const isVideoItem =
    item.type === 'video' ||
    item.type === 'movie' ||
    isYouTubeUrl(item.url) ||
    item.url.endsWith('.mp4') ||
    item.url.endsWith('.webm') ||
    item.url.includes('/video/');

  const getThumbnailUrl = () => {
    if (item.metadata?.thumbnailUrl) return item.metadata.thumbnailUrl;
    if (isYouTubeUrl(item.url)) {
      const ytId = getYouTubeId(item.url);
      if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
    if (item.url.endsWith('.mp4') || item.url.includes('/video/')) {
      return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
    }
    return item.url;
  };

  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image / Video Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={getThumbnailUrl()}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            if (isVideoItem) {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-indigo-700 shadow-sm border border-indigo-100 flex items-center gap-1">
          {isVideoItem && <Video className="w-3 h-3 text-indigo-600" />}
          <span>{item.category}</span>
        </div>

        {/* Resolution Tag */}
        {item.metadata?.resolution && (
          <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
            {item.metadata.resolution}
          </div>
        )}

        {/* Play Icon Badge Overlay for Videos */}
        {isVideoItem && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 z-20">
          <div className="text-xs text-slate-200 space-y-1">
            <div className="font-bold text-white truncate max-w-[180px]">{item.title}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-semibold">
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-300'}`} />
                {item.likes} Likes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                isLiked
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/90 text-slate-700 hover:text-rose-600 hover:bg-white'
              }`}
              title={isLiked ? 'Already Liked' : 'Like Asset'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </button>

            <button
              className="p-2 rounded-xl bg-indigo-600 backdrop-blur-md text-white hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-1"
              title={isVideoItem ? 'Play Video Stream' : 'Expand Photo View'}
            >
              {isVideoItem ? <Play className="w-4 h-4 fill-white" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {item.description || (isVideoItem ? 'Interactive video asset stream.' : 'Curated high-resolution photograph asset.')}
          </p>
        </div>

        {/* Tags & Likes */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap overflow-hidden h-5">
            {item.tags.slice(0, 2).map((t, idx) => (
              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-600">
                #{t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
            <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500' : ''}`} />
            <span>{item.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
