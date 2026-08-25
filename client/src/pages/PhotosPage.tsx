import React, { useEffect, useRef, useState } from 'react';
import { useMedia } from '../hooks/useMedia';
import { PhotoGrid } from '../components/PhotoGrid';
import { FilterBar } from '../components/FilterBar';
import { Pagination } from '../components/Pagination';
import {
  Camera,
  Image as ImageIcon,
  Film,
  Video,
  Eye,
  Heart,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  Flame,
  Globe,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

export const PhotosPage: React.FC = () => {
  const {
    mediaItems,
    pagination,
    loading,
    setActiveType,
    fetchMedia,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
  } = useMedia();

  // 3D Mouse Parallax Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Scroll reveal visibility hooks (Default to true so content is never hidden)
  const [filterVisible, setFilterVisible] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const POPULAR_TAGS = ['New Delhi', 'Jaipur', 'Himachal', 'Rajgir', 'Punjab', 'Vrindavan', 'Mathura', 'Varanasi'];

  useEffect(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveType('photo');
    fetchMedia({ page: 1, type: 'photo', category: undefined, search: undefined });
  }, []);

  // Intersection Observer for smooth scroll slider entrance
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const filterObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setFilterVisible(true);
      }
    }, observerOptions);

    const gridObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGridVisible(true);
      }
    }, observerOptions);

    if (filterRef.current) filterObserver.observe(filterRef.current);
    if (gridRef.current) gridObserver.observe(gridRef.current);

    return () => {
      filterObserver.disconnect();
      gridObserver.disconnect();
    };
  }, []);

  // Handle 3D Tilt Mouse Move over Hero Card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 15, y: -y * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handlePageChange = (page: number) => {
    fetchMedia({ page, type: 'photo' });
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (filterRef.current) {
      filterRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia({ search: searchQuery, type: 'photo' });
  };

  const handleQuickTagClick = (tag: string) => {
    setSelectedCategory(tag);
    fetchMedia({ category: tag, type: 'photo', page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 overflow-hidden">
      
      {/* 🌟 CASCADING STAGGERED 3D HERO SECTION WITH PARALLAX TILT */}
      <div className="animate-hero-container relative min-h-[600px] rounded-[2.5rem] hero-mesh-bg border border-slate-800 p-8 sm:p-14 overflow-hidden shadow-2xl flex flex-col justify-between text-white">
        
        {/* Ambient Hyper-Vibrant Neon Orbs */}
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/35 via-violet-600/30 to-cyan-400/25 rounded-full blur-[130px] pointer-events-none animate-pulse-glow"></div>
        <div className="absolute left-0 bottom-0 w-[450px] h-[450px] bg-gradient-to-tr from-rose-500/25 to-indigo-600/30 rounded-full blur-[110px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, Tags & Interactive Search */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Top Badge Drop In */}
            <div className="animate-badge-drop inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full text-xs font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 backdrop-blur-xl shadow-lg shadow-indigo-500/15">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Next-Gen Digital Vault • 500+ Ultra-HD Assets</span>
            </div>

            {/* 2. Main Display Headline Slide */}
            <h1 className="animate-headline-slide font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              The Ultimate Vault for <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">High-Resolution</span> Media Assets
            </h1>

            <p className="animate-headline-slide text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-xl">
              High-performance digital showcase offering instant photo search, ultra-crisp resolution, and curated photography collections.
            </p>

            {/* 3. Interactive Compact Glow Search Bar */}
            <form onSubmit={handleHeroSearch} className="animate-search-bounce max-w-xl flex items-center gap-1.5 p-1.5 sm:p-2 bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl shadow-indigo-500/20 focus-within:border-indigo-400 transition-all w-full">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search 500+ photos (Nature, Cyberpunk, 4K)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-2 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 bg-transparent focus:outline-none font-medium truncate"
                />
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-400 absolute left-3 top-2.5 sm:top-3" />
              </div>
              <button
                type="submit"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-1.5 shrink-0 hover:scale-105"
                title="Search Gallery"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </form>

            {/* 4. Quick Filter Tag Chips */}
            <div className="animate-headline-slide flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1 text-[10px] sm:text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1 text-[10px] sm:text-xs">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> Trending:
              </span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-900/80 hover:bg-indigo-600/40 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-300 font-medium transition-all text-[9.5px] sm:text-[11px] shadow-sm"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: 3D Mouse Parallax Tilt Banner */}
          <div className="lg:col-span-5 relative perspective-1000">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: tilt.x === 0 ? 'transform 0.5s ease-out' : 'none',
              }}
              className="animate-banner-3d relative rounded-3xl overflow-hidden shadow-2xl border-2 border-indigo-500/40 bg-slate-900 group cursor-pointer"
            >
              {/* Laser Scan Line Overlay */}
              <div className="animate-scan-line"></div>

              {/* Shimmer Light Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 -skew-x-12 animate-shimmer-sweep pointer-events-none z-20"></div>

              {/* User Provided Hero Image */}
              <img
                src="/img5.png"
                alt="FrameTrail Hero Showcase"
                className="w-full h-[360px] sm:h-[430px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
              />

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-cyan-400 border border-cyan-500/40 shadow-xl flex items-center gap-1.5 z-20">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Global Media Vault</span>
              </div>

              {/* Floating Bottom Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/40 text-white flex items-center justify-between shadow-2xl z-20">
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Premium Asset Streaming
                  </div>
                  <div className="text-[11px] text-slate-400">
                    High-Bitrate <span className="text-indigo-300 font-semibold">4K UHD Quality</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl shadow-sm">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Grid */}
        <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/90 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg hover:border-indigo-500/40 transition-colors min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 flex-shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-white truncate leading-snug">520+ Photos</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate leading-tight mt-0.5">Indexed & Curated</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg hover:border-cyan-500/40 transition-colors min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-white truncate leading-snug">Instant Load</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate leading-tight mt-0.5">High Speed Gallery</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg hover:border-violet-500/40 transition-colors min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30 flex-shrink-0">
              <HardDrive className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-white truncate leading-snug">4K UHD</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate leading-tight mt-0.5">Resolution Standard</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 sm:p-3.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-lg hover:border-emerald-500/40 transition-colors min-w-0 overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-black text-white truncate leading-snug">Curated Vault</div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate leading-tight mt-0.5">Direct Asset Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLL SLIDER SECTION: Filter Bar */}
      <div
        ref={filterRef}
        className={`transition-all duration-700 ease-out transform ${
          filterVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-12'
        }`}
      >
        <FilterBar />
      </div>

      {/* 3. SCROLL SLIDER SECTION: Photo Gallery Grid */}
      <div
        ref={gridRef}
        className={`scroll-mt-24 pt-2 transition-all duration-700 ease-out delay-150 transform ${
          gridVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16'
        }`}
      >
        <PhotoGrid items={mediaItems} loading={loading} />
      </div>

      {/* Pagination Controls */}
      <Pagination pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
};
