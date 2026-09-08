import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, ShieldAlert, Key, Lock, ArrowLeft, Mail, CheckCircle2, X, RefreshCw, Zap } from 'lucide-react';
import api from '../services/api';
import { logActivity } from '../utils/activityLogger';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Empty initial credentials state (no pre-filled email/password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSessionWarning, setActiveSessionWarning] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotNotice, setForgotNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 🔒 Account Security Lockout State (5 Wrong Attempts Lock)
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [unlockOtp, setUnlockOtp] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockNotice, setUnlockNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const executeLogin = async (force: boolean = false) => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both admin email and password.');
      return;
    }

    setError(null);

    // Check if an active admin session is already running in another tab/device
    const existingActiveSession = localStorage.getItem('frametrail_active_admin_session_id') || localStorage.getItem('frametrail_token');

    if (existingActiveSession && !force) {
      setActiveSessionWarning(true);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // Check if logged in user is strictly an admin
      const savedUser = JSON.parse(localStorage.getItem('frametrail_user') || '{}');
      if (savedUser.role !== 'admin') {
        localStorage.removeItem('frametrail_user');
        localStorage.removeItem('frametrail_token');
        setError('⛔ Access Denied: Standard user accounts cannot log in to the Administrator Control Panel. Please log in via the User Login page (/login).');
        return;
      }

      // 🔒 Generate & lock single active admin session ID for this browser tab
      const newSessionId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('frametrail_tab_admin_session_id', newSessionId);
      localStorage.setItem('frametrail_active_admin_session_id', newSessionId);

      logActivity({
        event: 'ADMIN_LOGIN',
        detail: `Administrator logged into Master Control Panel: ${email}.`,
        user: savedUser.name || 'Super Admin',
        level: 'success',
      });

      setActiveSessionWarning(false);
      navigate('/admin');
    } catch (err: any) {
      setActiveSessionWarning(false);
      const isLocked = err.response?.data?.data?.isLocked || err.response?.status === 423;
      const errorMessage = err.response?.data?.message || err.message || 'Server Error: Internal server issue occurred. Please try again.';

      setError(errorMessage);

      if (isLocked) {
        setUnlockEmail(email.trim().toLowerCase());
        setUnlockOtp('');
        setUnlockNotice({
          type: 'error',
          message: '5 Wrong Password Attempts Detected! A 6-digit OTP code has been dispatched to your Gmail inbox. Enter OTP below to unlock.',
        });
        setShowUnlockModal(true);
        // Automatically dispatch OTP to admin email for unlocking
        api.post('/auth/send-otp', {
          email: email.trim().toLowerCase(),
          name: 'Admin Security System',
          purpose: 'account_unlock',
        }).catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(false);
  };

  // Step 1: Send Real 6-Digit OTP to Gmail Inbox
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);
    setForgotLoading(true);

    try {
      await api.post('/auth/send-otp', { email: forgotEmail.trim(), name: 'FrameTrail Admin', purpose: 'forgot_password' });
      setForgotNotice({
        type: 'success',
        message: `Real 6-digit OTP code dispatched to ${forgotEmail}! Please check your Inbox.`,
      });
      setForgotStep(2);
    } catch (err: any) {
      setForgotNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch OTP email.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Admin Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);

    if (newPassword !== confirmNewPassword) {
      setForgotNotice({ type: 'error', message: 'Passwords do not match!' });
      return;
    }

    if (newPassword.length < 6) {
      setForgotNotice({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setForgotLoading(true);
    try {
      // First verify 6-digit OTP
      await api.post('/auth/verify-otp', { email: forgotEmail.trim(), otp: otpCode.trim(), purpose: 'forgot_password' });
      
      // Reset Password in MongoDB Atlas
      await api.post('/auth/reset-password', { email: forgotEmail.trim(), password: newPassword, otp: otpCode.trim() });

      setForgotNotice({
        type: 'success',
        message: 'Password reset successfully! You can now log in with your new password.',
      });

      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setEmail(forgotEmail);
        setPassword('');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1800);
    } catch (err: any) {
      setForgotNotice({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired OTP code! Please check your Gmail inbox.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Handler: Verify 6-digit OTP to Unlock Account & Auto-login to Admin Dashboard
  const handleVerifyUnlockOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockOtp.trim() || unlockOtp.trim().length < 4) {
      setUnlockNotice({ type: 'error', message: 'Please enter a valid 6-digit OTP code.' });
      return;
    }

    setUnlockNotice(null);
    setUnlockLoading(true);

    try {
      const res = await api.post('/auth/unlock-account', {
        email: unlockEmail.trim(),
        otp: unlockOtp.trim(),
      });

      if (res.data && res.data.success && res.data.data) {
        const { user, token } = res.data.data;
        localStorage.setItem('frametrail_token', token);
        localStorage.setItem('frametrail_user', JSON.stringify(user));

        // 🔒 Generate active admin session ID for this browser tab
        const newSessionId = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('frametrail_tab_admin_session_id', newSessionId);
        localStorage.setItem('frametrail_active_admin_session_id', newSessionId);

        setUnlockNotice({
          type: 'success',
          message: '🔓 Account Security Lock Removed! Directing to Admin Dashboard...',
        });

        setTimeout(() => {
          setShowUnlockModal(false);
          window.location.href = '/admin';
        }, 1200);
      }
    } catch (err: any) {
      setUnlockNotice({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired OTP code! Please check your Gmail inbox.',
      });
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleResendUnlockOtp = async () => {
    setUnlockLoading(true);
    try {
      await api.post('/auth/send-otp', {
        email: unlockEmail.trim(),
        name: 'Admin Security System',
        purpose: 'account_unlock',
      });
      setUnlockNotice({
        type: 'success',
        message: `Fresh 6-digit OTP code sent to ${unlockEmail}! Please check your Gmail inbox.`,
      });
    } catch (err: any) {
      setUnlockNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to resend OTP.',
      });
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#090d16]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-white relative overflow-hidden">
        
        {/* Glow Ambient Lights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Security Shield Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              Restricted Portal
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Admin Master Control Portal
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Authorized System Administrators Only
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg animate-in fade-in">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ⚠️ Active Admin Session Warning Banner */}
        {activeSessionWarning && (
          <div className="p-4 bg-amber-950/80 border-2 border-amber-500/60 rounded-2xl text-amber-200 text-xs font-semibold space-y-3 shadow-xl animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white text-sm font-black mb-0.5">⚠️ Active Session Detected</strong>
                <span>An Admin is currently logged in on another tab or device. Logging in will automatically terminate the previous session.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveSessionWarning(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeLogin(true)}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:opacity-95 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Login Anyway</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-medium relative z-10 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Admin Email
            </label>
            <input
              type="email"
              required
              placeholder="Enter admin email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (activeSessionWarning) setActiveSessionWarning(false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Admin Password
              </label>

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotNotice(null);
                  if (email) setForgotEmail(email);
                }}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (activeSessionWarning) setActiveSessionWarning(false);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating Admin...' : 'Authenticate & Access Admin Panel'}</span>
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Gallery
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal with Real Email OTP Verification */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotNotice && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg ${
                  forgotNotice.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {forgotNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{forgotNotice.message}</span>
                </div>
              </div>
            )}

            {forgotStep === 1 ? (
              /* Step 1 Form: Request 6-Digit OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-medium">
                <p className="text-slate-300 leading-relaxed">
                  Enter your registered Admin Email address. We will dispatch a <strong>Real 6-digit OTP code</strong> directly to your Gmail inbox.
                </p>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Admin Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@frametrail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{forgotLoading ? 'Sending OTP...' : 'Send 6-Digit OTP'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2 Form: Enter OTP & Reset Password */
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-medium">
                <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 font-semibold flex items-center justify-between">
                  <span>OTP sent to <strong className="font-mono text-white">{forgotEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleRequestOtp({ preventDefault: () => {} } as any)}
                    disabled={forgotLoading}
                    className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 948201"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center font-mono text-lg tracking-[0.4em] text-cyan-300 focus:outline-none focus:border-indigo-500 font-black"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">New Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-2.5 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !otpCode || !newPassword}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{forgotLoading ? 'Verifying & Saving...' : 'Verify OTP & Reset Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🔒 ACCOUNT SECURITY LOCKOUT OTP VERIFICATION MODAL */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <Lock className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="text-base font-black text-white">Unlock Admin Account</h3>
              </div>
              <button
                onClick={() => setShowUnlockModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-2xl text-xs text-rose-200 font-semibold space-y-1">
              <div className="flex items-center gap-2 font-extrabold text-rose-300">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>Security Protocol Initiated (5 Failed Logins)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                Your Admin account was automatically locked for security. A <strong>6-digit OTP code</strong> has been sent to <strong>{unlockEmail}</strong> to verify your identity.
              </p>
            </div>

            {unlockNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md ${
                  unlockNotice.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
                }`}
              >
                {unlockNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                <span>{unlockNotice.message}</span>
              </div>
            )}

            <form onSubmit={handleVerifyUnlockOtp} className="space-y-4 text-xs font-medium">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-bold">Enter 6-Digit Verification Code</label>
                  <button
                    type="button"
                    onClick={handleResendUnlockOtp}
                    disabled={unlockLoading}
                    className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 underline"
                  >
                    <RefreshCw className={`w-3 h-3 ${unlockLoading ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={unlockOtp}
                  onChange={(e) => setUnlockOtp(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500/30 rounded-xl p-3.5 text-center font-mono text-xl tracking-[0.4em] text-cyan-300 focus:outline-none focus:border-rose-500 font-black shadow-inner"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="py-2.5 px-4 bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-700 hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockLoading || !unlockOtp}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{unlockLoading ? 'Unlocking Dashboard...' : 'Verify OTP & Unlock Admin Dashboard'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
