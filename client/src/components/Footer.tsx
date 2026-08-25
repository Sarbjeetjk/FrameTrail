import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Video, Film, Heart, Mail, Phone, MessageSquare, Github, Twitter, Instagram, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-16 mb-0 pb-4">
      {/* 🌟 SLEEK 2D CARD FOOTER WITH MAIL, PHONE & CONTACT US */}
      <div className="relative overflow-hidden rounded-[2rem] hero-mesh-bg border border-slate-800 p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Ambient Hyper-Vibrant Neon Orbs */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-gradient-to-tr from-rose-500/15 to-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Main Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/90">
          
          {/* Brand Block */}
          <div className="flex items-center gap-3 text-center lg:text-left">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/20 overflow-hidden flex-shrink-0">
              <img
                src="/IMG_20240423_000718.png"
                alt="FrameTrail Logo"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div>
              <span className="font-display font-black text-2xl text-white tracking-tight">
                Frame<span className="text-indigo-400">Trail</span>
              </span>
              <p className="text-xs text-slate-400 font-medium">Digital Media Vault & Gallery</p>
            </div>
          </div>

          {/* Navigation Pill Chips */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center text-xs font-bold">

            <Link
              to="/contact"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/40 transition-all hover:scale-105 shadow-sm text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Social Badges */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-400 hover:text-white hover:bg-indigo-600/30 border border-slate-700/80 flex items-center justify-center transition-all hover:scale-110"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-400 hover:text-white hover:bg-indigo-600/30 border border-slate-700/80 flex items-center justify-center transition-all hover:scale-110"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-xl bg-slate-900/90 text-slate-400 hover:text-white hover:bg-indigo-600/30 border border-slate-700/80 flex items-center justify-center transition-all hover:scale-110"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Direct Contact Info Chips Row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-6 flex-wrap justify-center sm:justify-start">
            <a
              href="mailto:sarbjeetraj03579gmail.com"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>sarbjeetraj03579gmail</span>
            </a>

            <a
              href="tel:+917635095919"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 hover:text-violet-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-violet-400" />
              <span>+917635095919</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>© 2026 FrameTrail. All rights reserved.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
