import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IMediaItem } from '../types';
import { MediaCard } from './MediaCard';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getVideoPlayerInfo } from '../utils/videoUtils';
import {
  X,
  Heart,
  Download,
  Eye,
  HardDrive,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Play,
  Film,
} from 'lucide-react';
import { useMedia } from '../hooks/useMedia';

interface PhotoGridProps {
  items: IMediaItem[];
  loading?: boolean;
}

// Ultra-Smooth Silk Center-Compact to Spreading Card animation component
const CenterSpreadCard: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Instantly show cards on mobile screens to ensure zero rendering issues on touch devices
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.01, rootMargin: '100px 0px 100px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const itemsPerRow = 4;
  const colIndex = index % itemsPerRow;
  const rowIndex = Math.floor(index / itemsPerRow);

  const centerDistanceX = (1.5 - colIndex) * 60;
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

export const PhotoGrid: React.FC<PhotoGridProps> = ({ items, loading }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { likeMediaItem, userLikedIds } = useMedia();

  const selectedPhoto = selectedIndex !== null ? items[selectedIndex] : null;
  const isLiked = selectedPhoto ? userLikedIds.includes(selectedPhoto._id) : false;

  const hasPausedRef = useRef<boolean>(false);

  // Reset zoom & pan position when photo index changes or viewer closes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    hasPausedRef.current = false;
  }, [selectedIndex]);

  // Reset pan position whenever zoom level is reset back to 1
  useEffect(() => {
    if (zoomLevel === 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panPosition };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPanPosition({
        x: panStartRef.current.x + deltaX,
        y: panStartRef.current.y + deltaY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items.length]);

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : items.length - 1));
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! < items.length - 1 ? prev! + 1 : 0));
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.5).toFixed(1)), 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Helper checks for YouTube and Video streams
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  const isVideoItem = (item: IMediaItem) => {
    if (item.type === 'video' || item.type === 'movie') return true;
    const lower = (item.url || '').toLowerCase();
    return (
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('/video/') ||
      lower.includes('video') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.m3u8')
    );
  };

  // 🌟 Synchronous 2-Stage Backdrop Click: 1st click pauses video, 2nd click closes modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    // If target is inside inner card content, ignore backdrop click
    if ((e.target as HTMLElement).closest('.media-content-card')) {
      return;
    }

    if (selectedPhoto && isVideoItem(selectedPhoto)) {
      if (!hasPausedRef.current) {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        hasPausedRef.current = true;
        return; // STOP ON 1ST CLICK! DO NOT CLOSE!
      }
    }
    setSelectedIndex(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse flex flex-col justify-between p-4 shadow-sm"
          >
            <div className="w-full h-40 bg-slate-200 rounded-xl"></div>
            <div className="space-y-2 mt-4">
              <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
              <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 my-8 shadow-sm">
        <p className="text-slate-500 font-medium">No media assets found matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <CenterSpreadCard key={item._id} index={idx}>
            <MediaCard item={item} onSelect={() => setSelectedIndex(idx)} />
          </CenterSpreadCard>
        ))}
      </div>

      {/* 🌟 IMMERSIVE FULLSCREEN LIGHTBOX MULTI-MEDIA VIEWER */}
      {selectedPhoto &&
        createPortal(
          <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-150 overflow-hidden"
          >
            {/* Top Control Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-2xl text-white"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs font-bold border border-slate-700/80"
                  title="Back to Gallery"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {selectedPhoto.category}
                </span>
                <h2 className="text-xs sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {selectedPhoto.title}
                </h2>
              </div>

              {/* Controls: Enhanced 4x Multi-level Zoom & Close */}
              <div className="flex items-center gap-2 sm:gap-3">
                {!isVideoItem(selectedPhoto) && (
                  <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2 py-1 rounded-xl text-xs shadow-inner">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                      title="Zoom Out (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleResetZoom}
                      className="px-2.5 py-1 text-[11px] font-mono font-black text-amber-400 bg-slate-900 border border-slate-700/60 hover:border-amber-400/50 rounded-lg transition-all shadow-sm"
                      title="Click to Reset Zoom (100%)"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>

                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 4}
                      className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                      title="Zoom In (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setSelectedIndex(null)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Close Viewer (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage (1st click outside pauses video, 2nd click closes modal) */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-2 w-full overflow-hidden">
              {/* Previous Button */}
              {items.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700 shadow-2xl transition-all hover:scale-110"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Dynamic Multi-Media Player (YouTube / Google Drive / MP4 Video / Photo Image) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="media-content-card overflow-hidden flex items-center justify-center max-h-[75vh] max-w-[88vw] rounded-2xl shadow-2xl border border-slate-800/90 bg-black"
              >
                {(() => {
                  const playerInfo = getVideoPlayerInfo(selectedPhoto.url);
                  if (playerInfo.isEmbed) {
                    return (
                      <iframe
                        src={playerInfo.embedUrl}
                        title={selectedPhoto.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-[82vw] sm:w-[75vw] md:w-[65vw] aspect-video rounded-2xl border-0"
                      ></iframe>
                    );
                  }
                  if (isVideoItem(selectedPhoto)) {
                    return (
                      <video
                        ref={videoRef}
                        key={selectedPhoto.url}
                        src={selectedPhoto.url}
                        controls
                        autoPlay
                        className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl"
                      >
                        <source src={selectedPhoto.url} type="video/mp4" />
                        Your browser does not support HTML5 video playback.
                      </video>
                    );
                  }
                  return (
                    <img
                      src={getOptimizedImageUrl(selectedPhoto.url, 2560)}
                      alt={selectedPhoto.title}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80';
                      }}
                      className={`max-h-[75vh] max-w-[85vw] object-contain transition-transform duration-100 ease-out select-none ${
                        zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                      }`}
                      style={{
                        transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                          panPosition.y / zoomLevel
                        }px)`,
                      }}
                    />
                  );
                })()}
              </div>

              {/* Next Button */}
              {items.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-slate-900/90 hover:bg-indigo-600 text-white border border-slate-700 shadow-2xl transition-all hover:scale-110"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Metadata Footer Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 max-w-7xl mx-auto w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
                  <strong className="text-white font-bold">{selectedPhoto.likes}</strong> Likes
                </span>

                <span className="flex items-center gap-1.5 font-mono">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  {selectedPhoto.metadata?.resolution || '4K Ultra HD'}
                </span>
              </div>

              {/* Tags & Action */}
              <div className="flex items-center gap-3">
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedPhoto.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="bg-slate-800 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => likeMediaItem(selectedPhoto._id)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isLiked
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                      : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border-rose-500/40'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : 'fill-current'}`} />
                  <span>{isLiked ? 'Liked' : 'Like Media'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
