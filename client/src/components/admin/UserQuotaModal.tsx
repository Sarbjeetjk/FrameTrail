import React, { useState } from 'react';
import { X, Save, Camera, Video, AlertCircle } from 'lucide-react';
import { UserSpaceData } from '../../types';

interface UserQuotaModalProps {
  userSpace: UserSpaceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, maxPhotos: number, maxVideos: number) => Promise<void>;
}

export const UserQuotaModal: React.FC<UserQuotaModalProps> = ({
  userSpace,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !userSpace) return null;

  const [maxPhotos, setMaxPhotos] = useState<number>(userSpace.stats.maxPhotos || 100);
  const [maxVideos, setMaxVideos] = useState<number>(userSpace.stats.maxVideos || 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(userSpace.user.id || (userSpace.user as any)._id, maxPhotos, maxVideos);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update storage limits');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white">Adjust Storage Quota</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set custom photo & video limits for <span className="text-indigo-400 font-bold">{userSpace.user.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Max Photos Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Max Photo Upload Limit</span>
            </label>
            <input
              type="number"
              min="0"
              max="10000"
              value={maxPhotos}
              onChange={(e) => setMaxPhotos(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              Current usage: {userSpace.stats.photoCount} / {userSpace.stats.maxPhotos} photos
            </p>
          </div>

          {/* Max Videos Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Max Video Upload Limit</span>
            </label>
            <input
              type="number"
              min="0"
              max="1000"
              value={maxVideos}
              onChange={(e) => setMaxVideos(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-[11px] text-slate-500">
              Current usage: {userSpace.stats.videoCount} / {userSpace.stats.maxVideos} videos
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save New Limits'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
