import React from 'react';
import { Camera, Video, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';
import { UserSpaceQuota } from '../../types';

interface QuotaUsageCardProps {
  quota: UserSpaceQuota;
}

export const QuotaUsageCard: React.FC<QuotaUsageCardProps> = ({ quota }) => {
  if (quota.isUnlimited) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Unlimited Photos Meter */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Photos Quota</h3>
                <p className="text-[11px] text-indigo-300 font-medium">Administrator &bull; Unlimited Uploads</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {quota.usedPhotos} / &infin; Unlimited
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 w-full" />
          </div>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Super Admin storage &mdash; no photo limits applied.
          </p>
        </div>

        {/* Admin Unlimited Videos Meter */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Videos Quota</h3>
                <p className="text-[11px] text-cyan-300 font-medium">Administrator &bull; Unlimited Uploads</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {quota.usedVideos} / &infin; Unlimited
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 w-full" />
          </div>
          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Super Admin storage &mdash; no video limits applied.
          </p>
        </div>
      </div>
    );
  }

  const photoPercent = Math.min(100, Math.round((quota.usedPhotos / (quota.maxPhotos || 1)) * 100));
  const videoPercent = Math.min(100, Math.round((quota.usedVideos / (quota.maxVideos || 1)) * 100));

  const isPhotoNearLimit = quota.availablePhotos <= 5;
  const isVideoNearLimit = quota.availableVideos <= 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 📸 Photos Quota Meter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Photos Quota</h3>
              <p className="text-[11px] text-slate-400">High-resolution photography storage</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {quota.usedPhotos} / {quota.maxPhotos}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              photoPercent >= 90
                ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500'
            }`}
            style={{ width: `${photoPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium pt-1">
          <span className="text-slate-400">
            {quota.availablePhotos > 0 ? (
              <span className="text-emerald-400 font-bold">{quota.availablePhotos} uploads remaining</span>
            ) : (
              <span className="text-rose-400 font-bold">Storage limit reached</span>
            )}
          </span>
          <span className="text-slate-500 font-mono">{photoPercent}% used</span>
        </div>

        {isPhotoNearLimit && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span>Nearing photo storage limit. Admin can increase your quota.</span>
          </div>
        )}
      </div>

      {/* 🎬 Videos Quota Meter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Videos Quota</h3>
              <p className="text-[11px] text-slate-400">Reels, short clips & video files</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {quota.usedVideos} / {quota.maxVideos}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              videoPercent >= 90
                ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                : 'bg-gradient-to-r from-cyan-500 to-teal-400'
            }`}
            style={{ width: `${videoPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium pt-1">
          <span className="text-slate-400">
            {quota.availableVideos > 0 ? (
              <span className="text-emerald-400 font-bold">{quota.availableVideos} uploads remaining</span>
            ) : (
              <span className="text-rose-400 font-bold">Video limit reached</span>
            )}
          </span>
          <span className="text-slate-500 font-mono">{videoPercent}% used</span>
        </div>

        {isVideoNearLimit && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
            <span>Nearing video storage limit. Admin can increase your quota.</span>
          </div>
        )}
      </div>
    </div>
  );
};
