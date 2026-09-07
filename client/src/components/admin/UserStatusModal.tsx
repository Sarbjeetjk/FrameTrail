import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, Ban, AlertCircle, Save, Trash2, KeyRound, Lock } from 'lucide-react';
import { UserSpaceData } from '../../types';

interface UserStatusModalProps {
  userSpace: UserSpaceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, status: 'active' | 'blocked' | 'deactivated', blockReason?: string) => Promise<void>;
  onPurge?: (userId: string, adminPassword: string) => Promise<void>;
}

export const UserStatusModal: React.FC<UserStatusModalProps> = ({
  userSpace,
  isOpen,
  onClose,
  onSave,
  onPurge,
}) => {
  if (!isOpen || !userSpace) return null;

  const [status, setStatus] = useState<'active' | 'blocked' | 'deactivated'>(
    userSpace.user.status || 'active'
  );
  const [blockReason, setBlockReason] = useState<string>(userSpace.user.blockReason || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permanent Purge States
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [purging, setPurging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(userSpace.user.id || (userSpace.user as any)._id, status, blockReason);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user account status');
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setError('Admin password is required to permanently purge this account.');
      return;
    }
    if (!onPurge) return;

    setError(null);
    setPurging(true);
    try {
      await onPurge(userSpace.user.id || (userSpace.user as any)._id, adminPassword.trim());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Incorrect Admin Password or Failed to delete user');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white">Account Management & Anti-Spam</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage status for <span className="text-indigo-400 font-bold">{userSpace.user.name}</span>
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

        {!showPurgeConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Account Access Status</label>
              
              <div className="space-y-2">
                {/* 1. Active */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    status === 'active'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Active & In Good Standing</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      User can log in normally and upload within their designated quota.
                    </p>
                  </div>
                </label>

                {/* 2. Deactivated */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    status === 'deactivated'
                      ? 'bg-amber-950/40 border-amber-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="deactivated"
                    checked={status === 'deactivated'}
                    onChange={() => setStatus('deactivated')}
                    className="mt-1 accent-amber-500"
                  />
                  <div>
                    <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Temporary Deactivation</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Temporarily freeze account. User cannot log in until reactivated.
                    </p>
                  </div>
                </label>

                {/* 3. Blocked / Anti-Spam */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    status === 'blocked'
                      ? 'bg-rose-950/40 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="blocked"
                    checked={status === 'blocked'}
                    onChange={() => setStatus('blocked')}
                    className="mt-1 accent-rose-500"
                  />
                  <div>
                    <div className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                      <Ban className="w-4 h-4" />
                      <span>Permanent Block (Anti-Spam)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Suspends access immediately. Blocks logins and terminates active sessions.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason Input (if blocked or deactivated) */}
            {status !== 'active' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-slate-300">
                  Reason / Note for User & Logs
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spamming inappropriate media, policy violation..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* Danger Zone: Permanent Delete */}
            <div className="pt-3 border-t border-slate-800">
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" />
                    <span>Permanent Account Delete</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Purge account and all user-uploaded photos/videos from database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setShowPurgeConfirm(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors shrink-0 ml-2"
                >
                  Purge Data
                </button>
              </div>
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
                <span>{saving ? 'Saving...' : 'Apply Status'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* 🔐 Permanent Purge Confirmation Form (Requires Admin Password) */
          <form onSubmit={handlePurge} className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-black text-xs">
                <Trash2 className="w-4.5 h-4.5" />
                <span>Confirm Permanent Deletion with Admin Password</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Warning: Yeh action irreversible hai! User account <strong className="text-white font-bold">"{userSpace.user.name}"</strong> ({userSpace.user.email}) aur unke dwara upload ki gayi sabhi photos & videos database se permanently delete ho jayengi.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin Password Required</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Enter your Administrator password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-rose-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeConfirm(false);
                  setAdminPassword('');
                  setError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Back to Status
              </button>
              <button
                type="submit"
                disabled={purging || !adminPassword.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/40 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{purging ? 'Purging Account...' : 'Confirm Permanent Delete'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
