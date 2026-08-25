import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MediaService } from '../services/mediaService';
import api from '../services/api';
import { AdminStats, IMediaItem, MediaType } from '../types';
import { AdminTable } from '../components/AdminTable';
import { UploadModal } from '../components/UploadModal';
import {
  Camera,
  Video,
  Film,
  Eye,
  UploadCloud,
  RefreshCw,
  ShieldCheck,
  Layers,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Bell,
  Clock,
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';

import { useMedia } from '../hooks/useMedia';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isServerOnline, loading: authLoading, checkServerHealth } = useAuth();
  const { fetchMedia } = useMedia();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionLoadingText, setActionLoadingText] = useState<string>('Processing backend action...');
  const [serverError, setServerError] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [adminMediaList, setAdminMediaList] = useState<IMediaItem[]>([]);
  const [hiddenMediaList, setHiddenMediaList] = useState<IMediaItem[]>([]);
  const [hiddenCategoriesList, setHiddenCategoriesList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<MediaType | 'all' | 'trash' | 'hidden' | 'messages'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  // Search & Filter State for Admin Panel Main Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminTypeFilter, setAdminTypeFilter] = useState<MediaType | 'all'>('all');

  // Specific Type & Search Filter State for Hidden Vault
  const [hiddenTypeFilter, setHiddenTypeFilter] = useState<MediaType | 'all'>('all');
  const [hiddenSearchQuery, setHiddenSearchQuery] = useState('');

  // Reset category filter when switching tabs (Photos / Videos / Movies)
  useEffect(() => {
    setSelectedCategory('all');
    setHiddenSearchQuery('');
    setHiddenTypeFilter('all');
  }, [activeTab]);

  // Trash bin state backed by localStorage & MongoDB Atlas
  const [trashedMediaList, setTrashedMediaList] = useState<IMediaItem[]>([]);

  // Contact Messages Inbox state backed by MongoDB Atlas online database
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  const loadAdminData = async () => {
    setLoading(true);
    setServerError(false);
    try {
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        setServerError(true);
        setLoading(false);
        return;
      }

      const statsRes = await MediaService.getAdminStats().catch(() => null);
      const mediaRes = await MediaService.getAllAdminMedia().catch(() => null);
      const trashRes = await MediaService.getTrashedMedia().catch(() => null);
      const hiddenRes = await MediaService.getHiddenMedia().catch(() => null);
      const contactRes = await api.get('/contact').catch(() => null);

      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (mediaRes && mediaRes.success && mediaRes.data) {
        setAdminMediaList(mediaRes.data);
      }
      if (trashRes && trashRes.success && trashRes.data) {
        setTrashedMediaList(trashRes.data);
      }
      if (hiddenRes && hiddenRes.success && hiddenRes.data) {
        setHiddenMediaList(hiddenRes.data.hiddenItems || []);
        setHiddenCategoriesList(hiddenRes.data.hiddenCategories || []);
      }
      if (contactRes && contactRes.data && contactRes.data.data) {
        const msgs = contactRes.data.data.map((m: any) => ({
          ...m,
          id: m._id || m.id,
        }));
        setContactMessages(msgs);
      }
    } catch (err: any) {
      console.error('[Admin Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Soft Delete: Move item to Trash Bin (marks isDeleted: true in MongoDB Atlas and hides from public gallery)
  const handleSoftDelete = async (item: IMediaItem) => {
    setActionLoadingId(item._id);
    setActionLoadingText(`Trashing "${item.title}"...`);
    try {
      await MediaService.deleteMedia(item._id);
      const updatedTrash = [item, ...trashedMediaList.filter((t) => t._id !== item._id)];
      setTrashedMediaList(updatedTrash);
      localStorage.setItem('frametrail_admin_trash', JSON.stringify(updatedTrash));
      setAdminMediaList((prev) => prev.filter((i) => i._id !== item._id));

      setNotice(`"${item.title}" moved to Trash Bin and hidden from public gallery.`);
      setTimeout(() => setNotice(null), 4000);
      fetchMedia();
    } catch (err) {
      console.error('[Soft Delete Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restore: Restore item from Trash Bin back to active gallery in MongoDB Atlas
  const handleRestore = async (item: IMediaItem) => {
    setActionLoadingId(item._id);
    setActionLoadingText(`Restoring "${item.title}"...`);
    try {
      await MediaService.restoreMedia(item._id);
      const updatedTrash = trashedMediaList.filter((t) => t._id !== item._id);
      setTrashedMediaList(updatedTrash);
      localStorage.setItem('frametrail_admin_trash', JSON.stringify(updatedTrash));
      setAdminMediaList((prev) => [item, ...prev]);

      setNotice(`"${item.title}" restored successfully to public gallery.`);
      setTimeout(() => setNotice(null), 4000);
      await loadAdminData();
      fetchMedia();
    } catch (err) {
      console.error('[Restore Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete: Purge permanently from MongoDB Atlas & R2 Storage
  const handlePermanentDelete = async (id: string) => {
    setActionLoadingId(id);
    setActionLoadingText('Permanently purging asset from cloud database...');
    try {
      await MediaService.purgeMedia(id);
      const updatedTrash = trashedMediaList.filter((t) => t._id !== id);
      setTrashedMediaList(updatedTrash);
      localStorage.setItem('frametrail_admin_trash', JSON.stringify(updatedTrash));

      setNotice(`Asset permanently purged from MongoDB Atlas database & R2 storage.`);
      setTimeout(() => setNotice(null), 4000);
      await loadAdminData();
      fetchMedia();
    } catch (err) {
      console.error('[Permanent Purge Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin Password Protection for Unhiding items/categories
  const [unhideTarget, setUnhideTarget] = useState<{ type: 'item' | 'category'; item?: IMediaItem; categoryName?: string } | null>(null);
  const [unhidePassword, setUnhidePassword] = useState('');
  const [unhideError, setUnhideError] = useState<string | null>(null);
  const [verifyingUnhide, setVerifyingUnhide] = useState(false);

  const executeToggleHideItem = async (item: IMediaItem) => {
    setActionLoadingId(item._id);
    setActionLoadingText(`Updating privacy for "${item.title}"...`);
    try {
      const res = await MediaService.toggleHideItem(item._id);
      if (res.success && res.data) {
        const updatedItem = res.data;
        setNotice(res.message || 'Updated asset privacy status');
        setTimeout(() => setNotice(null), 4000);

        if (updatedItem.isHidden) {
          setAdminMediaList((prev) => prev.map((i) => (i._id === item._id ? { ...i, isHidden: true } : i)));
          setHiddenMediaList((prev) => [updatedItem, ...prev.filter((i) => i._id !== item._id)]);
        } else {
          setAdminMediaList((prev) => prev.map((i) => (i._id === item._id ? { ...i, isHidden: false } : i)));
          setHiddenMediaList((prev) => prev.filter((i) => i._id !== item._id));
        }

        await loadAdminData();
        fetchMedia();
      }
    } catch (err) {
      console.error('[Toggle Hide Item Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Privacy: Hide (1-click instant) or Unhide (Admin password required)
  const handleToggleHideItem = async (item: IMediaItem) => {
    if (item.isHidden) {
      // Unhiding requires Admin Password verification
      setUnhideTarget({ type: 'item', item });
      setUnhidePassword('');
      setUnhideError(null);
    } else {
      // Hiding is 1-click instant!
      executeToggleHideItem(item);
    }
  };

  const executeToggleHideCategory = async (catName: string) => {
    setActionLoadingId(catName);
    setActionLoadingText(`Updating category privacy for "${catName}"...`);
    try {
      const res = await MediaService.toggleHideCategory(catName);
      if (res.success) {
        setNotice(res.message || 'Updated category privacy status');
        setTimeout(() => setNotice(null), 4000);
        await loadAdminData();
        fetchMedia();
      }
    } catch (err) {
      console.error('[Toggle Hide Category Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Category Privacy: Hide (1-click instant) or Unhide (Admin password required)
  const handleToggleHideCategory = async (catName: string) => {
    const isCurrentlyHidden = hiddenCategoriesList.includes(catName);
    if (isCurrentlyHidden) {
      // Unhiding requires Admin Password verification
      setUnhideTarget({ type: 'category', categoryName: catName });
      setUnhidePassword('');
      setUnhideError(null);
    } else {
      // Hiding is 1-click instant!
      executeToggleHideCategory(catName);
    }
  };

  const handleConfirmUnhideWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unhidePassword.trim() || !unhideTarget) return;

    setVerifyingUnhide(true);
    setUnhideError(null);

    try {
      const activeToken = localStorage.getItem('frametrail_token') || localStorage.getItem('token');
      const res = await api.post(
        '/auth/verify-password',
        { password: unhidePassword.trim() },
        { headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {} }
      );
      if (res.data && res.data.success) {
        // Password verified! Execute actual unhide action
        if (unhideTarget.type === 'item' && unhideTarget.item) {
          await executeToggleHideItem(unhideTarget.item);
        } else if (unhideTarget.type === 'category' && unhideTarget.categoryName) {
          await executeToggleHideCategory(unhideTarget.categoryName);
        }
        setUnhideTarget(null);
        setUnhidePassword('');
      }
    } catch (err: any) {
      setUnhideError(err.response?.data?.message || 'Incorrect Admin Password! Access Denied.');
    } finally {
      setVerifyingUnhide(false);
    }
  };

  // Contact Messages Actions in MongoDB Atlas
  const handleMarkAsRead = async (msgId: string) => {
    setActionLoadingId(msgId);
    setActionLoadingText('Updating inquiry message status...');
    try {
      await api.patch(`/contact/${msgId}/read`);
      setContactMessages((prev) => prev.map((m) => (m.id === msgId || m._id === msgId ? { ...m, read: true } : m)));
    } catch (err) {
      console.error('[Mark Read Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    setActionLoadingId(msgId);
    setActionLoadingText('Deleting inquiry message...');
    try {
      await api.delete(`/contact/${msgId}`);
      setContactMessages((prev) => prev.filter((m) => m.id !== msgId && m._id !== msgId));
      setNotice('Contact message deleted from MongoDB Atlas.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      console.error('[Delete Message Error]', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Memoized Tab Filtering for 0ms Instantaneous Tab Switching (separates Visible vs Hidden items)
  const visibleAdminList = useMemo(() => adminMediaList.filter((i) => !i.isHidden), [adminMediaList]);
  const photoItems = useMemo(() => visibleAdminList.filter((i) => i.type === 'photo'), [visibleAdminList]);
  const videoItems = useMemo(() => visibleAdminList.filter((i) => i.type === 'video'), [visibleAdminList]);
  const movieItems = useMemo(() => visibleAdminList.filter((i) => i.type === 'movie'), [visibleAdminList]);

  const displayedItems = useMemo(() => {
    if (activeTab === 'trash') return trashedMediaList;
    let list = visibleAdminList;
    if (adminTypeFilter !== 'all') {
      list = list.filter((i) => i.type === adminTypeFilter);
    }
    return list;
  }, [activeTab, visibleAdminList, trashedMediaList, adminTypeFilter]);

  // Dynamically extract unique categories present specifically in the current active tab
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    displayedItems.forEach((item) => {
      if (item.category) {
        categoriesSet.add(item.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [displayedItems]);

  const effectiveSearchQuery = searchQuery || hiddenSearchQuery;

  // Apply Live Search & Category Filters for Main Admin CRUD Table
  const filteredDisplayedItems = useMemo(() => {
    return displayedItems.filter((item) => {
      // Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Live Search Query Filter
      if (effectiveSearchQuery.trim()) {
        const query = effectiveSearchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesId = item._id.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        const matchesTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(query)) : false;

        return matchesTitle || matchesCategory || matchesId || matchesType || matchesTags;
      }
      return true;
    });
  }, [displayedItems, effectiveSearchQuery, selectedCategory]);

  // Apply Type & Live Search Filters for Hidden Vault Assets
  const filteredHiddenMediaItems = useMemo(() => {
    return hiddenMediaList.filter((item) => {
      // Specific Media Type Filter for Hidden Vault
      if (hiddenTypeFilter !== 'all' && item.type !== hiddenTypeFilter) {
        return false;
      }
      // Category Filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Live Search Query Filter for Hidden Vault
      if (effectiveSearchQuery.trim()) {
        const query = effectiveSearchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesId = item._id.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        const matchesTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(query)) : false;

        return matchesTitle || matchesCategory || matchesId || matchesType || matchesTags;
      }
      return true;
    });
  }, [hiddenMediaList, hiddenTypeFilter, effectiveSearchQuery, selectedCategory]);

  // Filtered Category Names for Privacy Controls Board
  const filteredCategoryNames = useMemo(() => {
    const allCatList = Array.from(new Set([...availableCategories, ...hiddenCategoriesList])).filter(Boolean).sort();
    if (!effectiveSearchQuery.trim()) return allCatList;
    const query = effectiveSearchQuery.toLowerCase().trim();
    return allCatList.filter((cat) => cat.toLowerCase().includes(query));
  }, [availableCategories, hiddenCategoriesList, effectiveSearchQuery]);

  // Real-time Dynamic Metric Counts
  const photoCount = photoItems.length;
  const videoCount = videoItems.length;
  const movieCount = movieItems.length;
  const unreadMessagesCount = useMemo(() => contactMessages.filter((m) => !m.read).length, [contactMessages]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6 animate-in fade-in duration-300">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Verifying Admin Access...</h2>
          <p className="text-xs text-slate-400 font-medium">Checking authorization credentials with cloud server</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6 animate-in fade-in duration-300">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Loading Admin Dashboard...</h2>
          <p className="text-xs text-slate-400 font-medium">Fetching real-time metrics, media assets, & inquiries from cloud database</p>
        </div>

        {/* Animated Skeleton Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-900 border border-slate-800 p-4 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-800 rounded-full w-3/4"></div>
                <div className="h-5 bg-slate-800 rounded-full w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isServerOnline || serverError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Backend System Service Offline</h2>
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Server offline hai. System service active hone par hi Admin Panel open hoga.
        </p>
        <button
          onClick={async () => {
            const online = await checkServerHealth();
            if (online) {
              loadAdminData();
            }
          }}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      {/* Floating Active Backend Action Loading Status Indicator */}
      {actionLoadingId && (
        <div className="fixed top-20 right-6 z-50 bg-indigo-950/95 border border-indigo-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200 text-xs font-extrabold">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
          <span>{actionLoadingText}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Administrator Control Panel</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            FrameTrail System Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Contact Messages Notification Bell Button */}
          <button
            onClick={() => setActiveTab('messages')}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
            title="View Contact Messages Inbox"
          >
            <Bell className="w-4.5 h-4.5 text-indigo-400" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/profile"
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all shadow-sm font-extrabold text-xs flex items-center gap-2"
            title="Edit Admin Profile & Settings"
          >
            <User className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Profile Settings</span>
          </Link>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all hover:scale-105"
          >
            <UploadCloud className="w-4.5 h-4.5" />
            <span>Upload Media Asset</span>
          </button>
        </div>
      </div>

      {/* Notice Alert Banner */}
      {notice && (
        <div className="p-4 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl text-indigo-200 text-xs font-bold flex items-center justify-between animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-Time Dynamic Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Photo Vault Items</div>
            <div className="text-3xl font-black text-white mt-1">{photoCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Video Vault Items</div>
            <div className="text-3xl font-black text-white mt-1">{videoCount}</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Cinematic Movies</div>
            <div className="text-3xl font-black text-white mt-1">{movieCount}</div>
          </div>
        </div>

        {/* Contact Messages Metric Card */}
        <div
          onClick={() => setActiveTab('messages')}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4 cursor-pointer hover:border-indigo-500/40 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30 relative">
            <MessageSquare className="w-6 h-6" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Inquiries Inbox</div>
            <div className="text-3xl font-black text-white mt-1 flex items-center gap-2">
              <span>{contactMessages.length}</span>
              {unreadMessagesCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40">
                  {unreadMessagesCount} Unread
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Management Section with Type, Trash, & Contact Messages Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'messages' ? 'Contact Form Inquiries Inbox' : 'Media Asset Management (CRUD)'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {activeTab === 'messages'
                ? 'Review user inquiries and support messages submitted via Contact Us page'
                : 'Filter assets by type to view, edit, trash, or restore items'}
            </p>
          </div>

          {/* Streamlined Filter Tabs (All Assets / Contact Messages / Trash Bin) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-shrink-0 ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Assets ({adminMediaList.length})</span>
            </button>

            {/* Contact Messages Inbox Tab */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-shrink-0 ${
                activeTab === 'messages'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-500'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-500/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiries ({contactMessages.length})</span>
              {unreadMessagesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Trash Bin Tab */}
            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-shrink-0 ${
                activeTab === 'trash'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash Bin ({trashedMediaList.length})</span>
            </button>

            {/* Privacy Controls / Hidden Vault Tab */}
            <button
              onClick={() => setActiveTab('hidden')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex-shrink-0 ${
                activeTab === 'hidden'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-amber-500/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Hidden Vault ({hiddenMediaList.length + hiddenCategoriesList.length})</span>
            </button>
          </div>
        </div>

        {/* Live Search & Contextual Category / Type Filter Bar */}
        {activeTab !== 'messages' && (
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl">
            {/* Live Search Input Box */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search asset by title, city, tag, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 🌟 Media Type Filter Dropdown Pill (All Media / Photos Only / Short Videos / Movies) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Layers className="w-4 h-4 text-indigo-400 hidden sm:block flex-shrink-0" />
              <select
                value={adminTypeFilter}
                onChange={(e) => setAdminTypeFilter(e.target.value as MediaType | 'all')}
                className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-cyan-300 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Type: All Media</option>
                <option value="photo">📷 Type: Photos Only</option>
                <option value="video">🎥 Type: Short Videos</option>
                <option value="movie">🍿 Type: Movies / Streams</option>
              </select>
            </div>

            {/* Dynamic Type-Specific Category Dropdown Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-indigo-400 hidden sm:block flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-52 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">
                  All Asset Categories ({availableCategories.length})
                </option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Conditional Rendering: Media CRUD Table vs Contact Messages Inbox View */}
        {activeTab === 'messages' ? (
          <div className="space-y-4">
            {contactMessages.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="font-bold text-base text-white">No Contact Messages Received</div>
                <p className="text-xs text-slate-500 font-medium">
                  Submitted user inquiry messages will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {contactMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-6 rounded-3xl border transition-all space-y-3 ${
                      msg.read
                        ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                        : 'bg-slate-900 border-indigo-500/50 shadow-xl text-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                          {msg.name ? msg.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{msg.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-indigo-300 border border-slate-700">
                              {msg.category}
                            </span>
                            {!msg.read && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                                New Unread
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{msg.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-indigo-200">{msg.subject}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                        "{msg.message}"
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkAsRead(msg.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Read
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'hidden' ? (
          /* Privacy Controls & Hidden Vault View */
          <div className="space-y-8">
            {/* Category Privacy Control Board */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" />
                    <span>Category & City Privacy Controls</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Category hide karne par us category ka <b>sara media data aur category name chip</b> public site se instant hide ho jayega.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {hiddenCategoriesList.length} Hidden Categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCategoryNames.map((catName) => {
                    const isCategoryHidden = hiddenCategoriesList.includes(catName);
                    return (
                      <div
                        key={catName}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          isCategoryHidden
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                            : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-xs truncate">{catName}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {isCategoryHidden ? '🙈 Hidden from Public Site' : '👁️ Publicly Visible'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleHideCategory(catName)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 flex-shrink-0 shadow-sm ${
                            isCategoryHidden
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isCategoryHidden ? 'Unhide' : 'Hide Category'}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Individually Hidden Media Items Table */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Film className="w-4.5 h-4.5 text-amber-400" />
                    <span>Individually Hidden Media Assets ({filteredHiddenMediaItems.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Filter by specific photo, video, or movie type to unhide or edit details.
                  </p>
                </div>

                {/* Media Type Filter Segmented Controls */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setHiddenTypeFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      hiddenTypeFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Hidden ({hiddenMediaList.length})
                  </button>
                  <button
                    onClick={() => setHiddenTypeFilter('photo')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      hiddenTypeFilter === 'photo'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photos ({hiddenMediaList.filter((i) => i.type === 'photo').length})</span>
                  </button>
                  <button
                    onClick={() => setHiddenTypeFilter('video')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      hiddenTypeFilter === 'video'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span>Videos ({hiddenMediaList.filter((i) => i.type === 'video').length})</span>
                  </button>
                  <button
                    onClick={() => setHiddenTypeFilter('movie')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      hiddenTypeFilter === 'movie'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>Movies ({hiddenMediaList.filter((i) => i.type === 'movie').length})</span>
                  </button>
                </div>
              </div>

              {/* Hidden Vault Search Box */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search hidden asset by title, city, tag, or ID..."
                  value={hiddenSearchQuery}
                  onChange={(e) => setHiddenSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                />
                {hiddenSearchQuery && (
                  <button
                    onClick={() => setHiddenSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <AdminTable
                items={filteredHiddenMediaItems}
                isTrashView={false}
                onRefresh={loadAdminData}
                onSoftDelete={handleSoftDelete}
                onRestore={handleRestore}
                onToggleHide={handleToggleHideItem}
              />
            </div>
          </div>
        ) : (
          /* CRUD Table with Live Contextually Filtered Items */
          <AdminTable
            items={filteredDisplayedItems}
            isTrashView={activeTab === 'trash'}
            onRefresh={loadAdminData}
            onSoftDelete={handleSoftDelete}
            onRestore={handleRestore}
            onToggleHide={handleToggleHideItem}
            onPermanentDelete={handlePermanentDelete}
          />
        )}
      </div>

      {/* 🔐 Admin Password Required Modal for Unhiding Data */}
      {unhideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Admin Password Required</h3>
                  <p className="text-[11px] text-slate-400">Enter Admin Password to unhide asset & publish to gallery</p>
                </div>
              </div>
              <button
                onClick={() => setUnhideTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unhideError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{unhideError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmUnhideWithPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <span>Enter Password for:</span>
                  <span className="text-amber-300 truncate max-w-[200px]">
                    {unhideTarget.type === 'item' ? unhideTarget.item?.title : unhideTarget.categoryName}
                  </span>
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter Admin Password..."
                  value={unhidePassword}
                  onChange={(e) => setUnhidePassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUnhideTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={verifyingUnhide || !unhidePassword.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {verifyingUnhide ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Unhide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onSuccess={loadAdminData} />
    </div>
  );
};
