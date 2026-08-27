import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, ShieldAlert, Key, Lock, ArrowLeft, Mail, CheckCircle2, X, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Empty initial credentials state (no pre-filled email/password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Request OTP, 2: Enter OTP & New Password
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotNotice, setForgotNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('frametrail_tab_admin_session_id', newSessionId);
      localStorage.setItem('frametrail_active_admin_session_id', newSessionId);

      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Server Error: Internal server issue occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Real 6-Digit OTP to Gmail Inbox
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotNotice(null);
    setForgotLoading(true);

    try {
      await api.post('/auth/send-otp', { email: forgotEmail.trim(), name: 'FrameTrail Admin' });
      setForgotNotice({
        type: 'success',
        message: `Real 6-digit OTP code dispatched to ${forgotEmail}! Please check your Gmail Inbox.`,
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
      await api.post('/auth/verify-otp', { email: forgotEmail.trim(), otp: otpCode.trim() });
      
      // Reset Password in MongoDB Atlas
      await api.post('/auth/reset-password', { email: forgotEmail.trim(), password: newPassword });

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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
    </div>
  );
};
