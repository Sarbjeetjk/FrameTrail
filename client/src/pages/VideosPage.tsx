import React, { useEffect, useState, useRef } from 'react';
import { useMedia } from '../hooks/useMedia';
import { IMediaItem } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { FilterBar } from '../components/FilterBar';
import { Pagination } from '../components/Pagination';
import { Video, Play, Eye, Heart, Clock } from 'lucide-react';

// Reusable Graceful Center Compact to Spreading Video Card animation component
const CenterSpreadVideoCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.08, rootMargin: '0px 0px -10px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const itemsPerRow = 3;
  const colIndex = index % itemsPerRow;
  const rowIndex = Math.floor(index / itemsPerRow);

  const centerDistanceX = (1 - colIndex) * 70;
  const initialTransform = `translate3d(${centerDistanceX}px, 35px, 0) scale(0.85)`;

  const waveDelay = isVisible ? (colIndex + (rowIndex % 2) * 0.3) * 110 : 0;

  return (
    <div
      ref={cardRef}
      style={{
        transform: isVisible ? 'translate3d(0px, 0px, 0) scale(1)' : initialTransform,
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${waveDelay}ms`,
        willChange: 'transform, opacity',
      }}
      className="transition-all duration-[1250ms] cubic-bezier(0.16, 1, 0.3, 1) transform pointer-events-auto"
    >
      {children}
    </div>
  );
};

import { recordVisitorHit } from '../utils/visitorTracker';

export const VideosPage: React.FC = () => {
  const { mediaItems, pagination, loading, setActiveType, fetchMedia, setSelectedCategory, setSearchQuery } = useMedia();
  const [activeVideo, setActiveVideo] = useState<IMediaItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveType('video');
    fetchMedia({ page: 1, type: 'video', category: undefined, search: undefined });
    recordVisitorHit('Short Videos Vault');
  }, []);

  const handlePageChange = (page: number) => {
    fetchMedia({ page, type: 'video' });
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '03:45';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getVideoThumbnailUrl = (video: IMediaItem) => {
    if (video.metadata?.thumbnailUrl) return video.metadata.thumbnailUrl;
    const url = video.url || '';
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.endsWith('.mp4') || url.includes('/video/')) {
      return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
    }
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 overflow-hidden">
      
      {/* Hero Banner with HD Cinematic Image */}
      <div className="relative min-h-[380px] rounded-3xl overflow-hidden border border-slate-800 p-8 sm:p-12 shadow-2xl flex flex-col justify-between group">
        
        {/* HD Cinematic Camera Studio Background Image */}
        <img
          src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=80"
          alt="Cinematic Video Studio Background"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-65"
        />
        
        {/* Dark Glassmorphic Backdrop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/40 backdrop-blur-[2px]"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 shadow-lg border border-amber-500/30 backdrop-blur-md">
            <Video className="w-4 h-4 text-amber-400 animate-pulse" /> High-Bitrate Streaming Vault
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            Interactive Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-indigo-300">Streaming Showcase</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium drop-shadow">
            Seamless 1080p and 4K video clips, VFX animation reels, and documentary media crafted for creators, designers, and film enthusiasts.
          </p>
        </div>

        <div className="relative z-10 pt-6 flex items-center gap-4 text-xs font-bold text-slate-200">
          <span className="bg-slate-900/90 text-amber-300 px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md backdrop-blur-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            25+ High Quality Videos
          </span>
          <span className="bg-slate-900/90 text-indigo-300 px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-md backdrop-blur-md">
            ⚡ Zero Latency CDN Stream
          </span>
        </div>
      </div>

      <FilterBar />

      {/* Video Grid */}
      <div ref={gridRef} className="scroll-mt-24 pt-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((video, idx) => (
              <CenterSpreadVideoCard key={video._id} index={idx}>
                <div
                  onClick={() => setActiveVideo(video)}
                  className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={getVideoThumbnailUrl(video)}
                      alt={video.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-300" />
                      {formatDuration(video.metadata?.duration)}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                        {video.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-800 mt-2.5 group-hover:text-violet-600 transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-violet-600" /> {video.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" /> {video.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </CenterSpreadVideoCard>
            ))}
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      {/* Video Streaming Modal */}
      <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
};
