import React from 'react';
import { Eye, MapPin, ExternalLink, X } from 'lucide-react';

interface LogDetailsModalProps {
  selectedLogDetails: any;
  onClose: () => void;
}

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({
  selectedLogDetails,
  onClose,
}) => {
  if (!selectedLogDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">System Log Inspection Telemetry</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Event Details</div>
            <div className="font-bold text-white text-sm">{selectedLogDetails.event}</div>
            <p className="text-slate-300 font-medium">{selectedLogDetails.detail}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Client IP Address:</span>
              <span className="font-bold text-cyan-300 break-all sm:text-right">{selectedLogDetails.ip}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Geographical Location:</span>
              <span className="font-bold text-amber-300 break-all sm:text-right">{selectedLogDetails.location}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">ISP / Service Provider:</span>
              <span className="font-bold text-indigo-300 break-all sm:text-right">{selectedLogDetails.isp || 'Reliance Jio Infocomm'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Connection Speed:</span>
              <span className="font-bold text-violet-300 break-all sm:text-right">{selectedLogDetails.networkType || '4G / Wi-Fi'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Screen Resolution:</span>
              <span className="text-slate-300 break-all sm:text-right">{selectedLogDetails.screenRes || `${window.screen.width} x ${window.screen.height}`}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">System Timezone:</span>
              <span className="text-cyan-300 break-all sm:text-right">{selectedLogDetails.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Hardware & CPU:</span>
              <span className="text-amber-300 break-all sm:text-right">{selectedLogDetails.hardwareSpec || '8 GB RAM (8 Cores)'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2 gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">User / Actor:</span>
              <span className="font-bold text-white break-all sm:text-right">{selectedLogDetails.user}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 min-w-0">
              <span className="text-slate-400 font-medium shrink-0">Device & Browser:</span>
              <span className="text-slate-300 break-all sm:text-right">{selectedLogDetails.device}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <a
            href={
              selectedLogDetails.coordinates?.lat && selectedLogDetails.coordinates?.lng
                ? `https://www.google.com/maps?q=${selectedLogDetails.coordinates.lat},${selectedLogDetails.coordinates.lng}&z=14`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLogDetails.location)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <MapPin className="w-4 h-4 text-amber-300" />
            <span>Google Maps Location</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
