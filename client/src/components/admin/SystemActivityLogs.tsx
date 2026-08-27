import React from 'react';
import { Terminal, Trash2, RefreshCw, Eye, Globe, MapPin, Laptop, User, ExternalLink } from 'lucide-react';

interface SystemActivityLogsProps {
  systemLogs: any[];
  trashedSystemLogs: any[];
  logTab: 'active' | 'trash';
  setLogTab: (tab: 'active' | 'trash') => void;
  onRefresh: () => void;
  onClearLogs: () => void;
  onDeleteSingleLog: (target: { id: string; event: string }) => void;
  onRestoreLog: (log: any) => void;
  onSelectLogDetails: (log: any) => void;
}

export const SystemActivityLogs: React.FC<SystemActivityLogsProps> = ({
  systemLogs,
  trashedSystemLogs,
  logTab,
  setLogTab,
  onRefresh,
  onClearLogs,
  onDeleteSingleLog,
  onRestoreLog,
  onSelectLogDetails,
}) => {
  const displayedLogs = logTab === 'active' ? systemLogs : trashedSystemLogs;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>Live System Activity & User Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Track visitor IP address, geographical locations, devices, and admin actions in real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClearLogs}
            className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/40 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Logs</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Log Sub-Tabs: Active (Last 30 Days) vs Trash Archive (> 30 Days) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setLogTab('active')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              logTab === 'active'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Active Logs (30-Day Retention)</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
              {systemLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLogTab('trash')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              logTab === 'trash'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Log Trash Archive (&gt; 30 Days)</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              {trashedSystemLogs.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium px-2">
          {logTab === 'active'
            ? ''
            : ''}
        </div>
      </div>

      {displayedLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-3xl space-y-2 text-slate-400">
          <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-extrabold text-white">
            {logTab === 'active' ? 'No Active System Activity Logs' : 'Log Trash Archive Empty'}
          </h4>
          <p className="text-xs">
            {logTab === 'active'
              ? 'Logs created within the last 30 days will appear here in real-time.'
              : 'Activity logs older than 30 days will automatically archive here safely.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          {displayedLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-inner"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-indigo-400 font-bold">[{log.time}]</span>
                  <span className="text-cyan-300 font-black tracking-wide uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                    {log.event}
                  </span>
                  <span className="text-slate-400 font-sans text-[11px] flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>{log.user}</span>
                  </span>
                </div>

                <p className="text-slate-200 font-sans text-xs font-medium leading-relaxed">{log.detail}</p>

                {/* IP, Location & Device Bar */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 pt-1 font-sans">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 max-w-full break-all">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="break-all min-w-0">IP: {log.ip}</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-amber-300 font-bold bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{log.location}</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 max-w-full truncate">
                    <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{log.device}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0 w-full md:w-auto justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={() => onSelectLogDetails(log)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Details</span>
                </button>

                <a
                  href={
                    log.coordinates?.lat && log.coordinates?.lng
                      ? `https://www.google.com/maps?q=${log.coordinates.lat},${log.coordinates.lng}&z=14`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(log.location)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 font-extrabold text-xs border border-indigo-500/30 flex items-center gap-1.5 transition-all shadow-sm hover:border-indigo-400 active:scale-95"
                  title={`Open exact location for ${log.location} on Google Maps`}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Map</span>
                  <ExternalLink className="w-3 h-3 text-indigo-400" />
                </a>

                {logTab === 'trash' && (
                  <button
                    type="button"
                    onClick={() => onRestoreLog(log)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-extrabold text-xs border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    title="Restore Log to Active 30-Day Retention Stream"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Restore Log</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteSingleLog({ id: log.id, event: log.event })}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 hover:text-white font-extrabold text-xs border border-rose-500/30 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Delete Single Activity Log Entry (Requires Admin Password)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
