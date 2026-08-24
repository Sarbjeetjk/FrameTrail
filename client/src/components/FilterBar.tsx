import React, { useEffect, useState } from 'react';
import { useMedia } from '../hooks/useMedia';
import { MediaService } from '../services/mediaService';
import { Filter, SlidersHorizontal, Layers, Camera, Video, Film } from 'lucide-react';
import { MediaType } from '../types';

export const FilterBar: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    activeType,
    setActiveType,
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
    setSelectedCategory(cat);
    fetchMedia({ page: 1, category: cat === 'All' ? undefined : cat });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    const sortOrder = val === 'oldest' ? 'asc' : 'desc';
    fetchMedia({ page: 1, sortBy: 'createdAt', sortOrder });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as MediaType | 'all';
    setActiveType(val);
    fetchMedia({ page: 1, type: val === 'all' ? undefined : val });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
      
      {/* Category Section with Fixed Left Label */}
      <div className="flex items-center w-full md:w-auto min-w-0 overflow-hidden">
        {/* Fixed City Label */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 flex-shrink-0 pr-3 border-r border-slate-200/80 mr-3">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          <span>City:</span>
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

      {/* Right Controls: Type Filter & Sort By Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 w-full md:w-auto justify-end flex-shrink-0">
        
        {/* Media Type Filter (All / Photo / Video / Movie) */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-bold">Type:</span>
          <select
            value={activeType}
            onChange={handleTypeChange}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer border-none p-0 pr-1"
          >
            <option value="all">All Media</option>
            <option value="photo">📷 Photos Only</option>
            <option value="video">🎥 Short Videos</option>
            <option value="movie">🍿 Movies / Streams</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500 font-bold">Sort By:</span>
          <select
            value={sortBy === 'oldest' ? 'oldest' : 'latest'}
            onChange={handleSortChange}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer border-none p-0 pr-1"
          >
            <option value="latest">Latest Additions</option>
            <option value="oldest">Oldest Additions</option>
          </select>
        </div>

      </div>
    </div>
  );
};
