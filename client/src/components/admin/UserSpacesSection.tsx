import React, { useEffect, useState } from 'react';
import {
  Users,
  Camera,
  Video,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Search,
  Sliders,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calendar,
  UploadCloud,
} from 'lucide-react';
import { MediaService } from '../../services/mediaService';
import { UserSpaceData } from '../../types';
import { UserQuotaModal } from './UserQuotaModal';
import { UserStatusModal } from './UserStatusModal';
import { UserMediaViewerModal } from './UserMediaViewerModal';
import { UserAvatar } from '../UserAvatar';

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const UserSpacesSection: React.FC = () => {
  const [userSpaces, setUserSpaces] = useState<UserSpaceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated' | 'blocked'>('all');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [selectedUserSpace, setSelectedUserSpace] = useState<UserSpaceData | null>(null);
  const [quotaModalOpen, setQuotaModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [viewerModalOpen, setViewerModalOpen] = useState<boolean>(false);

  const fetchUserSpaces = async () => {
    try {
      setLoading(true);
      const res = await MediaService.getUserSpaces();
      if (res.success && res.data) {
        setUserSpaces(res.data);
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load user spaces and quota data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSpaces();
  }, []);

  const handleUpdateQuota = async (userId: string, maxPhotos: number, maxVideos: number) => {
    const res = await MediaService.updateUserQuota(userId, { maxPhotos, maxVideos });
    if (res.success) {
      setNotice({ type: 'success', message: res.message || 'Quota updated successfully!' });
      await fetchUserSpaces();
    }
  };

  const handleUpdateStatus = async (
    userId: string,
    status: 'active' | 'blocked' | 'deactivated',
    blockReason?: string
  ) => {
    const res = await MediaService.updateUserStatus(userId, status, blockReason);
    if (res.success) {
      setNotice({ type: 'success', message: res.message || 'User status updated successfully!' });
      await fetchUserSpaces();
    }
  };

  const handleDeleteUserMedia = async (mediaId: string) => {
    const res = await MediaService.deleteUserMedia(mediaId);
    if (res.success) {
      setNotice({ type: 'success', message: 'User media asset deleted successfully.' });
      await fetchUserSpaces();
      // Update items inside viewer modal if open
      if (selectedUserSpace) {
        setSelectedUserSpace((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.filter((i) => i._id !== mediaId),
                stats: {
                  ...prev.stats,
                  totalItems: prev.stats.totalItems - 1,
                },
              }
            : null
        );
      }
    }
  };

  const handlePurgeUser = async (userId: string, adminPassword: string) => {
    const res = await MediaService.purgeUserAccount(userId, adminPassword);
    if (res.success) {
      setNotice({
        type: 'success',
        message: res.message || 'User account and all uploaded data permanently deleted from database.',
      });
      setSelectedUserSpace(null);
      await fetchUserSpaces();
    }
  };

  // Metrics summary
  const totalUsers = userSpaces.length;
  const totalPhotosUploaded = userSpaces.reduce((acc, u) => acc + u.stats.photoCount, 0);
  const totalVideosUploaded = userSpaces.reduce((acc, u) => acc + u.stats.videoCount, 0);
  const blockedUsersCount = userSpaces.filter((u) => u.user.status === 'blocked').length;

  const filteredUsers = userSpaces.filter((u) => {
    const matchesStatus = statusFilter === 'all' || (u.user.status || 'active') === statusFilter;
    const matchesSearch =
      !search.trim() ||
      u.user.name.toLowerCase().includes(search.toLowerCase()) ||
      u.user.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
          <button onClick={() => setNotice(null)} className="text-xs hover:opacity-80 underline font-semibold ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalUsers}</div>
            <div className="text-xs text-slate-400 font-medium">Registered User Spaces</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalPhotosUploaded}</div>
            <div className="text-xs text-slate-400 font-medium">User Photos Stored</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalVideosUploaded}</div>
            <div className="text-xs text-slate-400 font-medium">User Videos Stored</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{blockedUsersCount}</div>
            <div className="text-xs text-slate-400 font-medium">Blocked Spammers</div>
          </div>
        </div>
      </div>

      {/* Main Table / User Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        {/* Controls: Search, Filter, Refresh */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Users ({totalUsers})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Active ({userSpaces.filter((u) => (u.user.status || 'active') === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('deactivated')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'deactivated'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Deactivated ({userSpaces.filter((u) => u.user.status === 'deactivated').length})
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'blocked'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Blocked ({blockedUsersCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={fetchUserSpaces}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh users list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* User Spaces List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400 font-bold">Loading user spaces & quotas...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-3">
            {filteredUsers.map((space) => {
              const u = space.user;
              const photoPercent = Math.min(
                100,
                Math.round((space.stats.photoCount / (space.stats.maxPhotos || 1)) * 100)
              );
              const videoPercent = Math.min(
                100,
                Math.round((space.stats.videoCount / (space.stats.maxVideos || 1)) * 100)
              );

              return (
                <div
                  key={u.id || (u as any)._id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-slate-700 transition-all"
                >
                  {/* User Info & Status */}
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <UserAvatar name={u.name} avatar={u.avatar} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate">{u.name}</span>
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            u.status === 'blocked'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : u.status === 'deactivated'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {u.status === 'blocked'
                            ? 'Blocked'
                            : u.status === 'deactivated'
                            ? 'Deactivated'
                            : 'Active'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate">{u.email}</div>
                      
                      {/* Account Created & Last Upload Dates with Time */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-slate-400">Created:</span>
                          <span className="text-slate-200 font-bold font-mono">
                            {formatDateTime(u.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800 shadow-sm">
                          <UploadCloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-slate-400">Last Upload:</span>
                          {space.stats.lastUploadAt ? (
                            <span className="text-cyan-300 font-bold font-mono">
                              {formatDateTime(space.stats.lastUploadAt)}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No uploads yet</span>
                          )}
                        </div>
                      </div>

                      {u.blockReason && (
                        <div className="text-[10px] text-rose-400 mt-1.5 italic truncate">
                          Reason: {u.blockReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quota Progress Meters */}
                  {space.stats.isUnlimited || u.role === 'admin' ? (
                    <div className="w-full lg:w-72 bg-gradient-to-r from-indigo-950/50 to-violet-950/50 p-3 rounded-xl border border-indigo-500/30 flex items-center justify-between shadow-inner">
                      <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span>Unlimited Storage (Admin)</span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                        No Limits
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-72 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                      {/* Photos Meter */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3 text-indigo-400" /> Photos
                          </span>
                          <span className="font-mono text-indigo-300 font-bold text-[10px]">
                            {space.stats.photoCount}/{space.stats.maxPhotos}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${photoPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Videos Meter */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold flex items-center gap-1">
                            <Video className="w-3 h-3 text-cyan-400" /> Videos
                          </span>
                          <span className="font-mono text-cyan-300 font-bold text-[10px]">
                            {space.stats.videoCount}/{space.stats.maxVideos}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="bg-cyan-500 h-full rounded-full transition-all"
                            style={{ width: `${videoPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
                    {/* View Uploads */}
                    <button
                      onClick={() => {
                        setSelectedUserSpace(space);
                        setViewerModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
                      title="View all photos & videos uploaded by this user"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Uploads ({space.items.length})</span>
                    </button>

                    {/* Adjust Quota (Only for regular users) */}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedUserSpace(space);
                          setQuotaModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
                        title="Increase or decrease storage quota"
                      >
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Adjust Quota</span>
                      </button>
                    )}

                    {/* Account Status / Anti-Spam (Only for regular users) */}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => {
                          setSelectedUserSpace(space);
                          setStatusModalOpen(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          u.status === 'blocked'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                            : u.status === 'deactivated'
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                        title="Block or deactivate account to prevent spam"
                      >
                        {u.status === 'blocked' ? (
                          <Ban className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Status</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No users match your criteria.</p>
            <p className="text-xs text-slate-500">Try changing the status filter or search term.</p>
          </div>
        )}
      </div>

      {/* Sub-Modals */}
      <UserQuotaModal
        userSpace={selectedUserSpace}
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onSave={handleUpdateQuota}
      />

      <UserStatusModal
        userSpace={selectedUserSpace}
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onSave={handleUpdateStatus}
        onPurge={handlePurgeUser}
      />

      <UserMediaViewerModal
        userSpace={selectedUserSpace}
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        onDeleteMedia={handleDeleteUserMedia}
      />
    </div>
  );
};
