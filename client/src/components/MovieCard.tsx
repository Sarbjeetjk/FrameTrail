import React from 'react';
import { IMediaItem } from '../types';
import { Star, Play, Calendar, User, Film } from 'lucide-react';

interface MovieCardProps {
  movie: IMediaItem;
  onPlay: (movie: IMediaItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlay }) => {
  // If movie.url is an MP4 or video link, use poster fallback for the <img> tag
  const isVideoUrl = movie.url?.endsWith('.mp4') || movie.url?.includes('/video/') || movie.url?.includes('googlevideo');
  const posterUrl = movie.metadata?.thumbnailUrl || (!isVideoUrl ? movie.url : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');
  
  const rating = movie.metadata?.rating || 8.5;
  const releaseYear = movie.metadata?.releaseYear || 2026;
  const director = movie.metadata?.director || 'FrameTrail Studios';

  return (
    <div
      onClick={() => onPlay(movie)}
      className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Poster Thumbnail */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-amber-600 border border-amber-200 shadow-sm flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{rating.toFixed(1)}</span>
        </div>

        {/* Year Pill */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-semibold text-white">
          {releaseYear}
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 flex flex-col justify-between flex-1 bg-white">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-extrabold uppercase tracking-wider">
            <Film className="w-3 h-3 text-amber-500" />
            <span>{movie.category}</span>
          </div>
          <h3 className="font-bold text-base text-slate-900 mt-1 group-hover:text-amber-600 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{director}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3 h-3" />
            <span>{releaseYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
