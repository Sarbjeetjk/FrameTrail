import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, ShieldCheck, CheckCircle2, Save, Key, AtSign, Camera, X, UploadCloud, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@user');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notice & Saving States
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Email Change OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Please Log In</h2>
        <p className="text-sm text-slate-400">You need to log in to view and edit your profile info.</p>
      </div>
    );
  }

  // Handle Avatar Image File Upload (Max 2MB)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxBytes = 2 * 1024 * 1024; // 2MB limit

      if (file.size > maxBytes) {
        setNotice({
          type: 'error',
          message: `Avatar image size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds max limit of 2MB!`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatar(reader.result as string);
          setNotice({
            type: 'success',
            message: 'New avatar image selected! Click "Save Profile Changes" to save.',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequestRealOtp = async (targetEmail: string) => {
    setSendingOtp(true);
    try {
      await api.post('/auth/send-otp', { email: targetEmail, name });
      setNotice({ type: 'success', message: `Real 6-digit OTP code dispatched to ${targetEmail}! Please check your Gmail Inbox.` });
    } catch (err: any) {
      console.error('[Send OTP Error]', err);
      setNotice({ type: 'error', message: err.response?.data?.message || 'Failed to dispatch OTP email.' });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (password && password !== confirmPassword) {
      setNotice({ type: 'error', message: 'Passwords do not match!' });
      return;
    }

    // If Email ID changed, trigger Real OTP to user's new Gmail Inbox
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      setShowOtpModal(true);
      await handleRequestRealOtp(email.trim());
      return;
    }

    // Save directly if Email ID hasn't changed
    await executeSave();
  };

  const executeSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        avatar,
        password: password || undefined,
      });

      setNotice({ type: 'success', message: 'Profile & avatar updated successfully!' });
      setPassword('');
      setConfirmPassword('');
      setShowOtpModal(false);
      setEmailOtp('');
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtpAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/verify-otp', { email: email.trim(), otp: emailOtp });
      await executeSave();
    } catch (err: any) {
      setNotice({ type: 'error', message: err.response?.data?.message || 'Invalid or expired OTP code! Please check your Gmail inbox.' });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>{user.role === 'admin' ? 'Administrator Account' : 'Verified Curator Profile'}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            User Profile & Account Settings
          </h1>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg ${
            notice.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Card & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Avatar & Account Badge Card */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
          <label htmlFor="avatar-file-input" className="cursor-pointer block">
            <div className="relative w-28 h-28 mx-auto rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-xl group">
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                <Camera className="w-6 h-6 text-indigo-300" />
                <span className="text-[10px] font-bold">Upload (Max 2MB)</span>
              </div>
            </div>
          </label>

          <div className="space-y-1">
            <h3 className="font-bold text-xl text-white">{name}</h3>
            <p className="text-xs text-indigo-400 font-semibold">{username}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{user.email}</p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-left font-medium text-slate-300">
            <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400">Account Type:</span>
              <span className="font-extrabold text-indigo-400 uppercase">{user.role}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400">Email Verification:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update your personal information, email address, and avatar image</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-indigo-400" /> Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
                {email.trim().toLowerCase() !== user.email.toLowerCase() && (
                  <p className="text-[10px] text-amber-400 font-semibold mt-1">
                    * Changing email will require OTP verification sent to {email}
                  </p>
                )}
              </div>

              {/* Avatar File Upload Input (Max 2MB) */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" /> Upload Avatar Image
                  </span>
                  <span className="text-[10px] text-indigo-400 font-bold">Max 2MB</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-file-input"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-3 text-white flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="text-xs text-slate-400 font-medium truncate">
                      Click to choose image file (Max 2MB)
                    </span>
                    <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/30 flex items-center gap-1 flex-shrink-0">
                      <UploadCloud className="w-3.5 h-3.5" /> Choose File
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Change Password (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Email Verification OTP Modal for Email Change */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Verify New Email Address</h3>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              We dispatched a real 6-digit verification OTP code to your Gmail inbox: <strong className="text-indigo-300 font-mono">{email}</strong>.
            </p>

            <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 font-semibold flex items-center justify-between">
              <span>Check your Gmail Inbox / Spam folder.</span>
              <button
                type="button"
                onClick={() => handleRequestRealOtp(email.trim())}
                disabled={sendingOtp}
                className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 underline disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                <span>{sendingOtp ? 'Sending...' : 'Resend OTP'}</span>
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndSave} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Enter 6-Digit OTP Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-mono text-lg tracking-[0.4em] text-cyan-300 focus:outline-none focus:border-indigo-500 font-black"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Verify & Save Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
