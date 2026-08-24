import React, { useState, useEffect } from 'react';
import { Film, Sparkles, ShieldCheck } from 'lucide-react';

export const IntroLoader: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress counter from 0% to 100% over ~3.0 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Trigger smooth fade-out transition at 3.2s
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3200);

    // Completely unmount component at 3.8s to reveal Home Page automatically
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 3800);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 transition-all duration-500 ease-in-out cursor-pointer ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/25 to-amber-500/25 rounded-full blur-[130px] animate-pulse"></div>

      {/* Main Glassmorphic Intro Container */}
      <div className="relative flex flex-col items-center text-center p-8 space-y-5 max-w-md w-full mx-4">
        
        {/* Official Brand Logo with Neon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-3xl blur-2xl opacity-75 animate-pulse"></div>
          
          <div className="relative w-36 sm:w-40 h-36 sm:h-40 rounded-[32px] bg-slate-900 border-2 border-indigo-400/50 shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center overflow-hidden p-2 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-amber-500/20"></div>
            
            {/* Spinning Neon Iris Ring */}
            <div className="absolute inset-1 rounded-[26px] border-2 border-indigo-500/40 border-t-amber-400 border-r-indigo-400 animate-spin"></div>
            
            {/* User Official Logo Image */}
            <img
              src="/IMG_20240423_000718.png"
              alt="FrameTrail Official Logo"
              className="w-full h-full object-cover rounded-[22px] shadow-lg transform group-hover:scale-105 transition-transform duration-500"
            />
            
            <Sparkles className="w-5 h-5 text-amber-400 absolute top-2.5 right-2.5 animate-bounce drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
        </div>

        {/* Brand Name reveal typography */}
        <div className="space-y-1 pt-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 uppercase font-sans">
            FRAME<span className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">TRAIL</span>
          </h1>
          <p className="text-xs font-bold text-indigo-300 tracking-[0.25em] uppercase flex items-center justify-center gap-2">
            <Film className="w-3.5 h-3.5 text-amber-400 inline" />
            <span>Cinematic Media Vault</span>
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="w-full space-y-2 pt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              LOADING STUDIO ASSETS...
            </span>
            <span className="text-amber-400 font-extrabold">{progress}%</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};
