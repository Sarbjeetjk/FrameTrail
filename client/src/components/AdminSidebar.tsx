import React, { useState } from 'react';
import {
  Layers,
  Camera,
  Video,
  Film,
  Eye,
  Trash2,
  MessageSquare,
  UploadCloud,
  User,
  ShieldCheck,
  PlusCircle,
  BarChart3,
  Settings,
  FolderLock,
  ChevronDown,
  LogOut,
  Activity,
  HardDrive,
  Database,
  Server,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  totalMediaCount: number;
  photoCount: number;
  videoCount: number;
  movieCount: number;
  hiddenCount: number;
  trashCount: number;
  messagesCount: number;
  unreadMessagesCount: number;
  userName?: string;
  userEmail?: string;
  onOpenUploadModal: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  totalMediaCount,
  photoCount,
  videoCount,
  movieCount,
  hiddenCount,
  trashCount,
  messagesCount,
  unreadMessagesCount,
  userName = 'Administrator',
  userEmail = 'admin@frametrail.com',
  onOpenUploadModal,
  onLogout,
}) => {
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(true);
  const [vaultsDropdownOpen, setVaultsDropdownOpen] = useState(true);
  const [securityDropdownOpen, setSecurityDropdownOpen] = useState(true);

  return (
    <aside className="w-full h-full min-h-0 flex flex-col justify-between animate-in fade-in duration-300">
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full min-h-0 overflow-hidden">
        {/* Scrollable Navigation Menu List */}
        <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 pb-2">
          {/* Admin Identity Card */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/90 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/30 flex-shrink-0">
              {userName ? userName[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-white truncate flex items-center gap-1">
                <span>{userName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 truncate">{userEmail}</div>
            </div>
          </div>

          {/* Quick Upload Action Button */}
          <button
            onClick={onOpenUploadModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Media Asset</span>
          </button>

        {/* 🌟 SECTION 1: ANALYTICS & SYSTEM DROPDOWN ACCORDION */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setAnalyticsDropdownOpen((prev) => !prev)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl text-[10.5px] font-black text-slate-300 uppercase tracking-wider flex items-center justify-between transition-all hover:text-white shadow-inner"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-cyan-300 font-extrabold">Analytics & System</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${
                analyticsDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Collapsible Dropdown Sub-Items */}
          {analyticsDropdownOpen && (
            <div className="space-y-1 pl-1 pt-1.5 animate-in fade-in duration-200">
              {/* System Analytics Tab */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-white' : 'text-cyan-400'}`} />
                  <span>Platform Analytics</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-black">
                  LIVE
                </span>
              </button>

              {/* User & Role Management Tab */}
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className={`w-4 h-4 ${activeTab === 'users' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>User & Team Roles</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
                  ROLES
                </span>
              </button>

              {/* 🌟 User Spaces & Storage Quotas Tab */}
              <button
                onClick={() => setActiveTab('user-spaces')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'user-spaces'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HardDrive className={`w-4 h-4 ${activeTab === 'user-spaces' ? 'text-white' : 'text-violet-400'}`} />
                  <span>User Spaces & Quotas</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[9px] font-black">
                  SPACES
                </span>
              </button>

              {/* System Audit Logs Tab */}
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'logs'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderLock className={`w-4 h-4 ${activeTab === 'logs' ? 'text-white' : 'text-amber-400'}`} />
                  <span>System Activity Logs</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black">
                  LOGS
                </span>
              </button>

              {/* Cloud & Database Storage Health Tab */}
              <button
                onClick={() => setActiveTab('health')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'health'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className={`w-4 h-4 ${activeTab === 'health' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>Storage & System Health</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                  HEALTH
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 🌟 SECTION 2: MEDIA VAULTS DROPDOWN ACCORDION */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <button
            type="button"
            onClick={() => setVaultsDropdownOpen((prev) => !prev)}
            className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl text-[10.5px] font-black text-slate-300 uppercase tracking-wider flex items-center justify-between transition-all hover:text-white shadow-inner"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-indigo-300 font-extrabold">Media Vaults Collections</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${
                vaultsDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Collapsible Dropdown Sub-Items */}
          {vaultsDropdownOpen && (
            <div className="space-y-1 pl-1 pt-1 animate-in fade-in duration-200">
              {/* All Assets Tab */}
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === 'all' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>All Media Items</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'all' ? 'bg-indigo-700 text-white' : 'bg-slate-950 text-indigo-300'
                }`}>
                  {totalMediaCount}
                </span>
              </button>

              {/* Photo Vault Tab */}
              <button
                onClick={() => setActiveTab('photo')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'photo'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className={`w-4 h-4 ${activeTab === 'photo' ? 'text-white' : 'text-indigo-400'}`} />
                  <span>Photo Vault</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'photo' ? 'bg-indigo-700 text-white' : 'bg-slate-950 text-indigo-300'
                }`}>
                  {photoCount}
                </span>
              </button>

              {/* Short Videos Tab */}
              <button
                onClick={() => setActiveTab('video')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'video'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className={`w-4 h-4 ${activeTab === 'video' ? 'text-white' : 'text-cyan-400'}`} />
                  <span>Short Videos</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'video' ? 'bg-indigo-700 text-white' : 'bg-slate-950 text-cyan-300'
                }`}>
                  {videoCount}
                </span>
              </button>

              {/* Cinematic Movies Tab */}
              <button
                onClick={() => setActiveTab('movie')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'movie'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Film className={`w-4 h-4 ${activeTab === 'movie' ? 'text-white' : 'text-amber-400'}`} />
                  <span>Cinematic Movies</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'movie' ? 'bg-indigo-700 text-white' : 'bg-slate-950 text-amber-300'
                }`}>
                  {movieCount}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 🌟 SECTION 3: SECURITY & INBOX DROPDOWN ACCORDION */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <button
            type="button"
            onClick={() => setSecurityDropdownOpen((prev) => !prev)}
            className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl text-[10.5px] font-black text-slate-300 uppercase tracking-wider flex items-center justify-between transition-all hover:text-white shadow-inner"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-300 font-extrabold">Security & User Inbox</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-rose-400 transition-transform duration-300 ${
                securityDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Collapsible Dropdown Sub-Items */}
          {securityDropdownOpen && (
            <div className="space-y-1 pl-1 pt-1 animate-in fade-in duration-200">
              {/* Hidden Vault Tab */}
              <button
                onClick={() => setActiveTab('hidden')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'hidden'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-500'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Eye className={`w-4 h-4 ${activeTab === 'hidden' ? 'text-white' : 'text-amber-400'}`} />
                  <span>Hidden Vault</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'hidden' ? 'bg-amber-700 text-white' : 'bg-slate-950 text-amber-300'
                }`}>
                  {hiddenCount}
                </span>
              </button>

              {/* User Inquiries Inbox Tab */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'messages' ? 'text-white' : 'text-purple-400'}`} />
                  <span>Inquiries Inbox</span>
                </div>
                {unreadMessagesCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white animate-bounce shadow-sm">
                    {unreadMessagesCount} New
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === 'messages' ? 'bg-purple-800 text-white' : 'bg-slate-950 text-purple-300'
                  }`}>
                    {messagesCount}
                  </span>
                )}
              </button>

              {/* Trash Bin Tab */}
              <button
                onClick={() => setActiveTab('trash')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'trash'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className={`w-4 h-4 ${activeTab === 'trash' ? 'text-white' : 'text-rose-400'}`} />
                  <span>Trash Bin</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === 'trash' ? 'bg-rose-800 text-white' : 'bg-slate-950 text-rose-300'
                }`}>
                  {trashCount}
                </span>
              </button>
            </div>
          )}
        </div>
        </div>

        {/* 🚪 ADMIN LOGOUT BUTTON - FIXED TO DISPLAY BOTTOM */}
        <div className="pt-3 border-t border-slate-800/90 bg-slate-900/95 backdrop-blur-md shrink-0 mt-auto sticky bottom-0 z-20">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-950/60 via-rose-900/40 to-slate-900 hover:from-rose-900/80 hover:to-rose-950 text-rose-300 hover:text-white font-black text-xs transition-all border border-rose-500/40 hover:border-rose-500/70 shadow-lg shadow-rose-950/30 group"
          >
            <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Logout Administrator</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
