import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMedia } from '../hooks/useMedia';
import { MediaService } from '../services/mediaService';
import { Filter, SlidersHorizontal, Layers, ShieldCheck } from 'lucide-react';
import { MediaType } from '../types';

export const FilterBar: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    activeType,
    setActiveType,
    searchQuery,
    setSearchQuery,
    fetchMedia,
  } = useMedia();

  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const queryType = activeType === 'all' ? undefined : activeType;
        const res = await MediaService.getCategories(queryType);
        if (res.success && res.data && isMounted) {
          const names = res.data
            .filter((c) => c._id && c.count > 0)
            .map((c) => c._id);

          const fullCategories = ['All', ...names];
          setCategories(fullCategories);

          // If selectedCategory is no longer in valid categories list for this active type, reset to 'All'
          if (selectedCategory !== 'All' && !names.includes(selectedCategory)) {
            setSelectedCategory('All');
            fetchMedia({ page: 1, category: undefined });
          }
        }
      } catch (err) {
        console.error('[Category Load Error]', err);
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [activeType]);

  const handleCategorySelect = (cat: string) => {
    setSearchQuery(''); // 🧹 Clear search input when category / city is clicked
    setSelectedCategory(cat);
    fetchMedia({ page: 1, category: cat === 'All' ? undefined : cat, search: undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchQuery(''); // 🧹 Clear search input when sort option is changed
    setSortBy(val);
    const sortOrder = val === 'oldest' ? 'asc' : 'desc';
    fetchMedia({ page: 1, sortBy: 'createdAt', sortOrder, search: undefined });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MediaType | 'all';
    setSearchQuery(''); // 🧹 Clear search input when asset type is changed
    setActiveType(val);
    fetchMedia({ page: 1, type: val === 'all' ? undefined : val, search: undefined });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
      
      {/* Category / City Section with Dynamic Label */}
      <div className="flex items-center w-full md:w-auto min-w-0 overflow-hidden">
        {/* Dynamic Label: "City / Location:" for Photos, "Category:" for Videos and Movies */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 flex-shrink-0 pr-3 border-r border-slate-200/80 mr-3">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>{activeType === 'photo' ? 'City / Location:' : 'Category:'}</span>
        </div>

        {/* Horizontal Category Chips Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [::-webkit-scrollbar]:hidden py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-600'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls: Ultra-Compact Type Filter & Sort By Pills */}
      <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-semibold text-slate-600 shrink-0">
        
        {/* Media Type Filter Pill */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm">
          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
          <span className="text-slate-500 font-bold text-[10px] sm:text-xs">Type:</span>
          <select
            value={activeType}
            onChange={handleTypeChange}
            className="bg-transparent text-[10px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer border-none p-0"
          >
            <option value="all">All</option>
            <option value="photo">📷 Photos</option>
            <option value="video">🎥 Videos</option>
            <option value="movie">🍿 Movies</option>
          </select>
        </div>

        {/* Sort By Dropdown Pill */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm">
          <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0" />
          <span className="text-slate-500 font-bold text-[10px] sm:text-xs">Sort:</span>
          <select
            value={sortBy === 'oldest' ? 'oldest' : 'latest'}
            onChange={handleSortChange}
            className="bg-transparent text-[10px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer border-none p-0"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

      </div>
    </div>
  );
};
