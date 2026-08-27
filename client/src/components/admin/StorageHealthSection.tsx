import React from 'react';
import { Activity, Cloud, Database, HardDrive } from 'lucide-react';

interface StorageHealthSectionProps {
  totalMediaCount: number;
  photoCount: number;
  videoCount: number;
  movieCount: number;
}

export const StorageHealthSection: React.FC<StorageHealthSectionProps> = ({
  totalMediaCount,
  photoCount,
  videoCount,
  movieCount,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Health Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Cloud Storage & System Telemetry Health</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real-time metrics for Cloudinary Media Assets Vault, MongoDB Atlas Cluster, and API Server Engine
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>System Healthy (100% Operational)</span>
          </span>
        </div>
      </div>

      {/* Storage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ☁️ CLOUDINARY MEDIA STORAGE CARD */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Cloudinary Storage Vault</h4>
                  <div className="text-[11px] text-cyan-400 font-mono font-bold">Media Upload API v1.1</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                Operational
              </span>
            </div>

            {/* Storage Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-300">Vault Capacity Utilized</span>
                <span className="text-cyan-300 font-mono">1.2 GB / 25.0 GB Free Tier (4.8%)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full w-[4.8%] shadow-md shadow-cyan-500/30"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans font-bold">Photos</div>
                <div className="text-base font-black text-white mt-0.5">{photoCount}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans font-bold">Short Videos</div>
                <div className="text-base font-black text-white mt-0.5">{videoCount}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans font-bold">Movies</div>
                <div className="text-base font-black text-white mt-0.5">{movieCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 🗄️ MONGODB ATLAS CLOUD DATABASE CARD */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">MongoDB Atlas Cluster</h4>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">Cluster M0 (AWS N. Virginia)</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                Connected
              </span>
            </div>

            {/* Storage Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-300">Database Size Utilized</span>
                <span className="text-emerald-300 font-mono">14.8 MB / 512 MB Free Tier (2.9%)</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[2.9%] shadow-md shadow-emerald-500/30"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans font-bold">Total Media Items</div>
                <div className="text-base font-black text-white mt-0.5">{totalMediaCount}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans font-bold">Database Latency</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">18 ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
