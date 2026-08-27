import React, { useEffect, useRef, useState } from 'react';
import { useMedia } from '../hooks/useMedia';
import { MediaService } from '../services/mediaService';
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

import { recordVisitorHit } from '../utils/visitorTracker';

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

  // Dynamic Available Tags State (Only Tags/Categories that exist in Database)
  const [dynamicTags, setDynamicTags] = useState<string[]>([]);

  // Auto-rotating Hero Index
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Scroll reveal visibility hooks (Default to true so content is never hidden)
  const [filterVisible, setFilterVisible] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveType('photo');
    fetchMedia({ page: 1, type: 'photo', category: undefined, search: undefined });
    recordVisitorHit('Photos Showcase Gallery');
  }, []);

  // Strictly filter items to type === 'photo' for the Photos Page Hero Showcase
  const photoOnlyItems = (mediaItems || []).filter((item) => item.type === 'photo');

  // 🔄 Auto-cycle Hero Banner Showcase every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 🖼️ Combine uploaded photos with curated showcase slides so images ALWAYS auto-rotate continuously
  const activeSlides = React.useMemo(() => {
    const defaultSlides = [
      {
        url: '/img5.png',
        title: 'Cinematic Visual Vault',
        category: 'New Delhi',
        likes: 245,
        id: 'default-hero-1',
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        title: 'Sunset Horizon & Beach Shores',
        category: 'Nature & Landscape',
        likes: 312,
        id: 'default-hero-2',
      },
      {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        title: 'Neon Cyberpunk Metropolis',
        category: 'Digital Art',
        likes: 428,
        id: 'default-hero-3',
      },
      {
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        title: 'Starlight Mountain Peak',
        category: 'Astronomy',
        likes: 580,
        id: 'default-hero-4',
      },
      {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
        title: 'Misty Alpine Forest',
        category: 'Landscape',
        likes: 198,
        id: 'default-hero-5',
      },
    ];

    if (photoOnlyItems.length === 0) return defaultSlides;

    const uploaded = photoOnlyItems.map((item) => ({
      url: item.url,
      title: item.title,
      category: item.category,
      likes: item.likes,
      id: item._id,
    }));

    return [...uploaded, ...defaultSlides].slice(0, 5);
  }, [photoOnlyItems]);

  const heroDisplayData = activeSlides[heroIndex % activeSlides.length];

  // 🏷️ Load ONLY AVAILABLE tags/categories from uploaded database items
  useEffect(() => {
    const loadRealAvailableTags = async () => {
      try {
        const catRes = await MediaService.getCategories('photo');
        const realCategories = catRes.success && catRes.data
          ? catRes.data.filter((c: any) => c._id && c.count > 0).map((c: any) => c._id)
          : [];

        const realItemTags = (mediaItems || [])
          .filter((m) => m.type === 'photo')
          .flatMap((m) => [...(m.tags || []), m.category])
          .filter(Boolean);

        const allAvailable = Array.from(new Set([...realCategories, ...realItemTags]))
          .filter((t) => t && t !== 'All' && t !== 'General');

        const shuffled = allAvailable.sort(() => 0.5 - Math.random()).slice(0, 8);
        setDynamicTags(shuffled);
      } catch (err) {
        console.error('[Available Tags Load Error]', err);
      }
    };

    loadRealAvailableTags();
  }, [mediaItems]);

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

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    fetchMedia({ page: 1, type: 'photo', search: tag });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia({ page: 1, type: 'photo', search: searchQuery });
  };

  const currentHeroItem = photoOnlyItems.length > 0 ? photoOnlyItems[heroIndex % photoOnlyItems.length] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* 1. Dynamic Hero Header Section with Interactive 3D Parallax Card */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800/90 p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Glow Spheres Background Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="tracking-wide">FRESH MEDIA VAULT • AUTOMATICALLY UPDATING</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Discover & Stream <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-amber-300">
                Ultra-HD Visual Assets
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              Curated collection of high-resolution photos, 4K digital artwork, and production video assets. Updated continuously with user contributions.
            </p>

            {/* Search Input Bar */}
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

            {/* Quick Filter Tag Chips (Only Available Tags in Database) */}
            {dynamicTags.length > 0 && (
              <div className="animate-headline-slide flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1 text-[10px] sm:text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1 text-[10px] sm:text-xs">
                  <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-bounce" /> Trending:
                </span>
                {dynamicTags.map((tag) => (
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
            )}
          </div>

          {/* Right Column: Dynamic Auto-Rotating 3D Showcase Banner */}
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

              {/* Auto-rotating Hero Image */}
              <img
                key={heroDisplayData.id}
                src={heroDisplayData.url}
                alt={heroDisplayData.title}
                className="w-full h-[360px] sm:h-[430px] object-cover group-hover:scale-105 transition-all duration-700 opacity-95 animate-in fade-in"
              />

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

              {/* Floating Top Badge */}
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold text-cyan-400 border border-cyan-500/40 shadow-xl flex items-center gap-1.5 z-20">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Latest Upload Showcase</span>
              </div>

              {/* Carousel Dot Indicators (5 Slides: Slide 0 is default /img5.png, Slides 1-4 are uploaded photos) */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === heroIndex ? 'w-5 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                    title={idx === 0 ? 'Main Showcase' : `Photo Slide #${idx}`}
                  />
                ))}
              </div>

              {/* Floating Bottom Live Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/40 text-white flex items-center justify-between shadow-2xl z-20">
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{heroDisplayData.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Category: <span className="text-indigo-300 font-semibold">{heroDisplayData.category}</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {heroDisplayData.likes} Likes
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
