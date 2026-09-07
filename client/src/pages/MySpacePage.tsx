import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MediaService } from '../services/mediaService';
import { IMediaItem, UserSpaceQuota } from '../types';
import { SpaceHeader } from '../components/myspace/SpaceHeader';
import { QuotaUsageCard } from '../components/myspace/QuotaUsageCard';
import { UserMediaGrid } from '../components/myspace/UserMediaGrid';
import { UserLatestShowcase } from '../components/myspace/UserLatestShowcase';
import { UploadModal } from '../components/UploadModal';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const MySpacePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [quota, setQuota] = useState<UserSpaceQuota | null>(null);
  const [items, setItems] = useState<IMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSpaceData = async () => {
    try {
      setLoading(true);
      const res = await MediaService.getMySpace();
      if (res.success && res.data) {
        setQuota(res.data.quota);
        setItems(res.data.items);
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load your personal storage space',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSpaceData();
    }
  }, [isAuthenticated]);

  const handleDeleteItem = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await MediaService.deleteMyMedia(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        // Refresh quota
        await fetchSpaceData();
        setNotice({ type: 'success', message: 'Asset removed and quota restored successfully!' });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete media asset',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/user-login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {notice && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border ${
            notice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-xs hover:opacity-80 underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Header with Avatar & Upload CTA */}
      <SpaceHeader user={user} onOpenUpload={() => setUploadModalOpen(true)} />

      {/* 2. Photo & Video Quotas */}
      {quota && <QuotaUsageCard quota={quota} />}

      {/* 3. Personal Latest Upload Showcase / Empty State Banner */}
      {!loading && (
        <UserLatestShowcase
          items={items}
          onOpenUpload={() => setUploadModalOpen(true)}
        />
      )}

      {/* 4. Media Grid of Personal Uploads */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Loading your personal storage vault...</span>
        </div>
      ) : (
        <UserMediaGrid
          items={items}
          onDelete={handleDeleteItem}
          deletingId={deletingId}
          onOpenUpload={() => setUploadModalOpen(true)}
        />
      )}

      {/* Upload Modal (Integrated with User Space) */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false);
          fetchSpaceData();
          setNotice({ type: 'success', message: 'Asset uploaded successfully to your space!' });
        }}
      />
    </div>
  );
};
