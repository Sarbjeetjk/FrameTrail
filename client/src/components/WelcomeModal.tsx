import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, ShieldCheck } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface WelcomeModalProps {
  onOpenUpload?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('frametrail_just_logged_in');
    if (justLoggedIn === 'true' && user) {
      setIsVisible(true);
      setIsExiting(false);
      sessionStorage.removeItem('frametrail_just_logged_in');

      // Auto-slide away after 2.6 seconds
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 400);
      }, 2600);

      return () => clearTimeout(exitTimer);
    }
  }, [user]);

  if (!isVisible || !user) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md pointer-events-none">
      {/* Moving Slide Toast Card */}
      <div
        className={`pointer-events-auto relative overflow-hidden bg-slate-900/95 backdrop-blur-2xl border-2 border-indigo-500/70 rounded-3xl p-4 sm:p-4.5 shadow-2xl shadow-indigo-600/40 text-white select-none ${
          isExiting ? 'animate-slide-out' : 'animate-slide-in'
        }`}
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-3.5">
          {/* Clean User Font Initial Avatar (No overlapping icons) */}
          <div className="relative flex-shrink-0">
            <UserAvatar name={user.name} avatar={user.avatar} size="lg" showOnlineBadge={false} />
          </div>

          {/* Greeting Text */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">
                Welcome, {user.name}! 🎉
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate">
              Login successful &bull; Vault ready
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => setIsVisible(false), 350);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2.6s Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            style={{
              animation: 'countdownProgress 2.6s linear forwards',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideMoveIn {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.92);
          }
          65% {
            transform: translateY(8px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideMoveOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.95);
          }
        }

        @keyframes countdownProgress {
          from { width: 100%; }
          to { width: 0%; }
        }

        .animate-slide-in {
          animation: slideMoveIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-out {
          animation: slideMoveOut 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
      `}</style>
    </div>
  );
};
