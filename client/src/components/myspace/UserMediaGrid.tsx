import React, { useState } from 'react';
import { IMediaItem, MediaType } from '../../types';
import { Camera, Video, Trash2, Eye, ExternalLink, Search, HardDrive, AlertCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserMediaGridProps {
  items: IMediaItem[];
  onDelete: (id: string) => void;
  deletingId: string | null;
  onOpenUpload: () => void;
}

export const UserMediaGrid: React.FC<UserMediaGridProps> = ({
  items,
  onDelete,
  deletingId,
  onOpenUpload,
}) => {
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filterType === 'photo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photos ({items.filter((i) => i.type === 'photo').length})</span>
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              filterType === 'video'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({items.filter((i) => i.type === 'video' || i.type === 'movie').length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search your uploads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Grid of User Media */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group relative bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-xl transition-all"
            >
              {/* Thumbnail Media Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                    {item.metadata?.thumbnailUrl ? (
                      <img
                        src={item.metadata.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                      item.type === 'photo'
                        ? 'bg-indigo-900/80 text-indigo-200 border-indigo-500/30'
                        : 'bg-cyan-900/80 text-cyan-200 border-cyan-500/30'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-slate-300 backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <Link
                    to={`/media/${item._id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold transition-colors border border-slate-800"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  {deleteConfirmId === item._id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onDelete(item._id);
                          setDeleteConfirmId(null);
                        }}
                        disabled={deletingId === item._id}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black"
                      >
                        {deletingId === item._id ? 'Deleting...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item._id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete asset (reclaims storage quota)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Personal Space is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Start uploading your favorite photos and short videos. Your uploads are strictly private to your account.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Upload First Asset
          </button>
        </div>
      )}
    </div>
  );
};
