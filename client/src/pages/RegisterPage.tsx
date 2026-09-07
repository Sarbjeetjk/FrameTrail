import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserPlus, ShieldAlert, Info, Key, Mail, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectReason = searchParams.get('redirect');

  // Step 1: User Account Details
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // Step 2: OTP Verification
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resend Cooldown Countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to User's Email via SendGrid
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        purpose: 'register',
      });

      setStep(2);
      setResendCooldown(60);
      setSuccessMessage(`A 6-digit verification code has been dispatched to ${email.trim()}! Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.error('[Send OTP Error]', err);
      setError(err.response?.data?.message || err.message || 'Failed to dispatch verification code. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/send-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        purpose: 'register',
      });

      setResendCooldown(60);
      setSuccessMessage(`New verification code dispatched to ${email.trim()}!`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create FrameTrail Account
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, otp.trim(), role);
      logActivity({
        event: 'USER_REGISTERED',
        detail: `New verified user registered account: ${name} (${email}) [Role: ${role.toUpperCase()}].`,
        user: name,
        level: 'success',
      });
      sessionStorage.setItem('frametrail_just_logged_in', 'true');
      navigate('/my-space');
    } catch (err: any) {
      console.error('[Registration Error]', err);
      setError(err.response?.data?.message || err.message || 'Verification failed. Please check the code and try again.');
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
            {step === 1 ? 'Create FrameTrail Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 1
              ? 'Join the cloud media gallery platform'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-indigo-600' : 'w-4 bg-emerald-500'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-200'}`} />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && !error && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Initial Form */
          <form onSubmit={handleRequestOtp} className="space-y-4 font-medium">
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
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Sending Verification Code...' : 'Send Verification OTP'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerifyAndRegister} className="space-y-4 font-medium animate-in fade-in">
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Verification code sent to:</span>
                <span className="font-bold text-indigo-950">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold underline text-xs"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                className="w-full bg-slate-50 border-2 border-indigo-200 rounded-2xl py-3 px-3.5 text-2xl font-mono text-center tracking-[0.5em] text-indigo-700 font-black focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Verifying & Creating Account...' : 'Verify & Create Account'}</span>
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};
