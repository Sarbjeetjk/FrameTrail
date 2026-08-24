import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserPlus, ShieldAlert, Info, Mail, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectReason = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Email Verification States
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  const handleSendOtp = async (targetEmail: string) => {
    setSendingOtp(true);
    setError(null);
    try {
      const res = await api.post('/auth/send-otp', { email: targetEmail.trim(), name, checkExisting: true });
      setOtpSuccessMessage(res.data?.message || 'OTP Sent Successfully! Please check your Gmail Inbox.');
      
      // If Cloud fallback active, auto-populate OTP for seamless UX
      if (res.data?.data?.devOtp) {
        setOtpCode(res.data.data.devOtp);
      }
      
      setIsVerifyingEmail(true);
    } catch (err: any) {
      console.error('[Send OTP Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to send OTP email. Please verify your email address.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Step 1: Send Real 6-Digit OTP to Gmail Inbox
    await handleSendOtp(email);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // First verify 6-digit OTP with backend
      await api.post('/auth/verify-otp', { email: email.trim(), otp: otpCode.trim() });

      // Create User Account
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      console.error('[Verify & Register Error]', err);
      setError(err.response?.data?.message || err.message || 'Server Error: Internal server issue occurred. Please try again.');
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
            <span>Please create an account or sign in first to like media assets!</span>
          </div>
        )}

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-indigo-200 mx-auto shadow-md shadow-indigo-500/25 overflow-hidden">
            <img
              src="/IMG_20240423_000718.png"
              alt="FrameTrail Logo"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {isVerifyingEmail ? 'Verify Your Email Address' : 'Create FrameTrail Account'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isVerifyingEmail ? `Enter 6-digit verification code sent to ${email}` : 'Join the cloud media gallery platform'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isVerifyingEmail ? (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4 font-medium animate-in fade-in">
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-semibold space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>OTP Code Dispatched!</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendOtp(email)}
                  disabled={sendingOtp}
                  className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} /> Resend OTP
                </button>
              </div>
              <p className="text-[11px] text-indigo-700 font-normal">
                Check your Gmail Inbox (<strong className="font-mono">{email}</strong>) or Spam folder for your 6-digit verification code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 849201"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-lg font-mono text-center tracking-[0.4em] text-indigo-700 font-black focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !otpCode}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying & Registering...' : 'Verify Email & Create Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVerifyingEmail(false)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Back to Registration Form
            </button>
          </form>
        ) : (
          <form onSubmit={handleInitialSubmit} className="space-y-4 font-medium">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{sendingOtp ? 'Sending  OTP...' : 'Send Verification Code'}</span>
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
