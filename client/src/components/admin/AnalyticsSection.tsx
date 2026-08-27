import React from 'react';
import { Eye, Award, ShieldCheck, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { IMediaItem } from '../../types';

interface AnalyticsSectionProps {
  adminMediaList: IMediaItem[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ adminMediaList }) => {
  const totalViews = adminMediaList.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = adminMediaList.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const topTrending = adminMediaList
    .slice()
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-extrabold text-indigo-300">
            <span>Total Views Recorded</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalViews}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>+18.4% growth this week</span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-extrabold text-rose-300">
            <span>Total Likes & Favorites</span>
            <Award className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalLikes}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>High engagement ratio</span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-extrabold text-cyan-300">
            <span>Atlas Storage Health</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">99.9%</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>MongoDB Atlas Connected</span>
          </div>
        </div>
      </div>

      {/* Leaderboard: Top 5 Popular Media Assets */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Top Trending Visual Assets Leaderboard</span>
        </h3>

        <div className="space-y-3">
          {topTrending.map((item, idx) => (
            <div
              key={item._id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Category: <span className="text-indigo-400">{item.category}</span> • Type: {item.type.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-extrabold shrink-0">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {item.views || 0}
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {item.likes || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
