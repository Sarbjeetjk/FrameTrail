import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, ShieldAlert, Info, Key, CheckCircle2, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { logActivity } from '../utils/activityLogger';

export const LoginPage: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectReason = searchParams.get('redirect');

  // Empty initial state (no pre-filled credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Block Admin accounts on standard login page
      const savedUser = JSON.parse(localStorage.getItem('frametrail_user') || '{}');
      if (savedUser.role === 'admin') {
        localStorage.removeItem('frametrail_user');
        localStorage.removeItem('frametrail_token');
        setError('⛔ Access Denied: Administrator accounts cannot log in through the standard User Login page. Please log in via the Secure Admin Portal (/admin-login).');
        return;
      }
      logActivity({
        event: 'USER_LOGIN',
        detail: `User logged into account: ${email}.`,
        user: savedUser.name || email,
        level: 'info',
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Server Error: Internal server issue occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Real 6-Digit OTP to Gmail Inbox
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-otp', { email: resetEmail.trim(), name: 'FrameTrail User' });
      setError(null);
      setResetCodeSent(true);
    } catch (err: any) {
      console.error('[Send OTP Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP email. Please check your email address.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Verify OTP & Reset User Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // First verify OTP with backend
      await api.post('/auth/verify-otp', { email: resetEmail.trim(), otp: resetOtp.trim() });
      
      // Reset Password in MongoDB Atlas
      await resetPassword(resetEmail, newPassword);
      setResetSuccess(true);
      setEmail(resetEmail);
      setPassword(newPassword);
    } catch (err: any) {
      console.error('[Reset Password Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Banner Notice for Like Attempt */}
        {redirectReason === 'like' && (
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Please sign in first to like photos, videos & media assets!</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-indigo-200 mx-auto shadow-md shadow-indigo-500/25 overflow-hidden">
            <img
              src="/IMG_20240423_000718.png"
              alt="FrameTrail Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {isForgotPassword ? 'Reset Your Password' : 'Welcome Back to FrameTrail'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isForgotPassword ? 'Follow the steps to recover access to your account' : 'Sign in to access your media vault and management tools'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Flow */}
        {isForgotPassword ? (
          <div className="space-y-4 font-medium">
            {resetSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Password Reset Successfully!</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Your password has been updated in MongoDB Atlas. You can now log in using your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Proceed to Login
                </button>
              </div>
            ) : !resetCodeSent ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enter Account Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{sendingOtp ? 'Sending Real OTP...' : 'Send Reset Verification Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-semibold flex items-center justify-between">
                  <span>Verification code sent to <strong>{resetEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleSendResetCode({ preventDefault: () => {} } as any)}
                    disabled={sendingOtp}
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} /> Resend OTP
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 849201"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-lg font-mono text-center tracking-[0.4em] text-indigo-700 font-black focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{loading ? 'Resetting Password...' : 'Reset & Save Password'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-medium">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotPassword(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          </>
        )}

        <div className="text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};
