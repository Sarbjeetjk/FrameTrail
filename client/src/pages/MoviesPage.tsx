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

  useEffect(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveType('movie');
    fetchMedia({ page: 1, type: 'movie', category: undefined, search: undefined });
  }, []);

  const handlePageChange = (page: number) => {
    fetchMedia({ page, type: 'movie' });
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featuredMovie = mediaItems.find((m) => m.isFeatured) || mediaItems[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Featured Movie Billboard Hero Section */}
      {featuredMovie && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950">
          <div className="relative aspect-[21/9] min-h-[420px] w-full">
            <img
              src={
                featuredMovie.metadata?.thumbnailUrl ||
                (!featuredMovie.url.endsWith('.mp4') ? featuredMovie.url : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80')
              }
              alt={featuredMovie.title}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8 sm:p-14 max-w-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider shadow-sm">
                  Featured Cinematic Movie
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {featuredMovie.metadata?.rating || 9.2} / 10
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                {featuredMovie.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-200 line-clamp-2 leading-relaxed max-w-2xl font-medium">
                {featuredMovie.description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveMovie(featuredMovie)}
                  className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" /> Watch Film / Trailer
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
