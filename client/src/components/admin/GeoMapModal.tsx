import React from 'react';
import { Globe, X } from 'lucide-react';

interface GeoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeoMapModal: React.FC<GeoMapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Live Visitor & System Geo Map</h3>
              <p className="text-[11px] text-slate-400">Real-time geographical locations of active site visitors & server requests</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Simulated Map Graphic */}
        <div className="relative h-64 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Map Locations Pulsating Markers */}
          <div className="absolute left-[30%] top-[45%] flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 p-2 rounded-xl text-xs font-bold text-white shadow-xl animate-pulse">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
            <span>📍 New Delhi (103.211.54.12)</span>
          </div>

          <div className="absolute left-[55%] top-[60%] flex items-center gap-2 bg-slate-900/90 border border-amber-500/40 p-2 rounded-xl text-xs font-bold text-white shadow-xl">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span>📍 Mumbai (13.235.12.89)</span>
          </div>

          <div className="absolute left-[65%] top-[75%] flex items-center gap-2 bg-slate-900/90 border border-rose-500/40 p-2 rounded-xl text-xs font-bold text-white shadow-xl">
            <span className="w-3 h-3 rounded-full bg-rose-400"></span>
            <span>📍 Bengaluru (182.73.19.45)</span>
          </div>

          <div className="text-center space-y-1 z-10 pointer-events-none opacity-40">
            <Globe className="w-16 h-16 text-indigo-400 mx-auto" />
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Global Visitor Activity Heatmap</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 font-medium">
            Active locations: <span className="text-cyan-300 font-bold">New Delhi, Mumbai, Bengaluru</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
          >
            Close Geo Map
          </button>
        </div>
      </div>
    </div>
  );
};
