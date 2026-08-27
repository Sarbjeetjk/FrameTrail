import React, { useEffect, useState, useRef } from 'react';
import { useMedia } from '../hooks/useMedia';
import { IMediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { FilterBar } from '../components/FilterBar';
import { Pagination } from '../components/Pagination';
import { Film, Star, Play } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const { mediaItems, pagination, loading, setActiveType, fetchMedia, setSelectedCategory, setSearchQuery } = useMedia();
  const [activeMovie, setActiveMovie] = useState<IMediaItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveType('movie');
    fetchMedia({ page: 1, type: 'movie', category: undefined, search: undefined });
  }, []);

  // Strictly filter items to type === 'movie' for the Movies Billboard Showcase
  const movieOnlyItems = (mediaItems || []).filter((item) => item.type === 'movie');

  // 🔄 Auto-rotate Billboard Hero Movie showcase every 5 seconds for Movies ONLY
  useEffect(() => {
    if (movieOnlyItems.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % Math.min(movieOnlyItems.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [movieOnlyItems.length]);

  const handlePageChange = (page: number) => {
    fetchMedia({ page, type: 'movie' });
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featuredMovie = movieOnlyItems.length > 0 ? movieOnlyItems[featuredIndex % movieOnlyItems.length] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Featured Movie Billboard Hero Section with Auto-rotator */}
      {featuredMovie && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group">
          <div className="relative aspect-[21/9] min-h-[420px] w-full">
            <img
              key={featuredMovie._id}
              src={
                featuredMovie.metadata?.thumbnailUrl ||
                (!featuredMovie.url.endsWith('.mp4') && !featuredMovie.url.includes('drive.google.com')
                  ? featuredMovie.url
                  : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80')
              }
              alt={featuredMovie.title}
              className="w-full h-full object-cover opacity-75 animate-in fade-in duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

            {/* Top Carousel Navigation Dots */}
            {mediaItems.length > 1 && (
              <div className="absolute top-6 right-6 flex items-center gap-2 z-20 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 mr-1 uppercase tracking-wider">
                  Trending Showcase
                </span>
                {mediaItems.slice(0, 6).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === featuredIndex ? 'w-6 bg-amber-400 shadow-lg shadow-amber-400/50' : 'w-2.5 bg-slate-700 hover:bg-slate-400'
                    }`}
                    title={`Go to Movie #${idx + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="absolute bottom-0 left-0 p-8 sm:p-14 max-w-3xl space-y-4 z-10">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 fill-slate-950" /> Latest Upload Movie
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {featuredMovie.metadata?.rating || 9.2} / 10
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {featuredMovie.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 line-clamp-2 leading-relaxed max-w-2xl font-medium drop-shadow">
                {featuredMovie.description || 'Watch high-definition cinematic release streaming live on FrameTrail.'}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveMovie(featuredMovie)}
                  className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" /> Watch Movie Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <FilterBar />

      {/* Movies Grid */}
      <div ref={gridRef} className="scroll-mt-24 pt-2">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {mediaItems.map((movie) => (
              <MovieCard key={movie._id} movie={movie} onPlay={(m) => setActiveMovie(m)} />
            ))}
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={handlePageChange} />

      {/* Movie Trailer Player Modal */}
      <VideoPlayerModal video={activeMovie} onClose={() => setActiveMovie(null)} />
    </div>
  );
};
