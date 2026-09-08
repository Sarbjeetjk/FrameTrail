import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Camera, Video, Trash2, Eye, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { UserSpaceData, IMediaItem } from '../../types';
import { UserAvatar } from '../UserAvatar';

interface UserMediaViewerModalProps {
  userSpace: UserSpaceData | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteMedia: (mediaId: string) => Promise<void>;
}

export const UserMediaViewerModal: React.FC<UserMediaViewerModalProps> = ({
  userSpace,
  isOpen,
  onClose,
  onDeleteMedia,
}) => {
  if (!isOpen || !userSpace) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'video'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<IMediaItem | null>(null);

  const filteredItems = userSpace.items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photo') return item.type === 'photo';
    return item.type === 'video' || item.type === 'movie';
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user asset as administrator?')) return;
    setDeletingId(id);
    try {
      await onDeleteMedia(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={userSpace.user.name}
              avatar={userSpace.user.avatar}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{userSpace.user.name}'s Uploaded Assets</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {userSpace.items.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{userSpace.user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/50 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Uploads ({userSpace.items.length})
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photos ({userSpace.stats.photoCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos ({userSpace.stats.videoCount})</span>
          </button>
        </div>

        {/* Content Body: Grid of Items */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="group bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  <div
                    onClick={() => setSelectedPreview(item)}
                    className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer group"
                  >
                    {item.type === 'photo' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                        {item.metadata?.thumbnailUrl ? (
                          <img
                            src={item.metadata.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {item.type}
                    </span>

                    <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/80 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-sm border border-white/20">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-xs font-black text-white line-clamp-1">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{item.category}</span>
                        <span>&bull;</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/media/${item._id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-bold transition-colors"
                          title="View Full Media Showcase Page"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Full Asset</span>
                        </Link>
                        <span className="text-slate-700">&bull;</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-slate-400 hover:text-white text-[11px] font-medium"
                          title="Open direct file URL"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 transition-colors"
                        title="Delete asset (moderation)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2">
              <p className="text-sm font-bold text-white">No items found for this user.</p>
              <p className="text-xs text-slate-500">This user has not uploaded any {activeTab === 'all' ? 'assets' : activeTab + 's'} yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Asset Quick Lightbox Preview Modal */}
      {selectedPreview && (
        <div
          onClick={() => setSelectedPreview(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">{selectedPreview.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {selectedPreview.category} &bull; {selectedPreview.type.toUpperCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/media/${selectedPreview._id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Showcase</span>
                </Link>
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh] border border-slate-800">
              {selectedPreview.type === 'photo' ? (
                <img
                  src={selectedPreview.url}
                  alt={selectedPreview.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              ) : (
                <video src={selectedPreview.url} controls autoPlay className="max-h-[60vh] w-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
