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

const formatLogTime = (timestamp?: number, staticTime?: string, logId?: string) => {
  let timeVal = timestamp;

  if (!timeVal && logId) {
    const match = logId.match(/\d{12,14}/);
    if (match) {
      timeVal = parseInt(match[0], 10);
    }
  }

  if (!timeVal) return staticTime || 'Just now';

  const diffMs = Date.now() - timeVal;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 30) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  const dateObj = new Date(timeVal);
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

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
                  <span className="text-indigo-400 font-bold">[{formatLogTime(log.timestamp, log.time, log.id)}]</span>
                  
                  {/* Contextual Event Badge */}
                  <span
                    className={`font-black tracking-wide uppercase px-2 py-0.5 rounded border text-[10px] ${
                      log.event === 'ACCOUNT_CREATED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : log.event.includes('UPLOAD')
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        : log.event.includes('DELETE') || log.event.includes('TRASH') || log.event.includes('PURGE')
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : log.event.includes('LOGIN')
                        ? 'bg-violet-950/80 text-violet-300 border-violet-500/40'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {log.event}
                  </span>

                  {/* Rich User Info: Name, Email & Role Tag */}
                  <span className="text-slate-300 font-sans text-[11px] flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-800">
                    <User className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="font-bold text-white">{log.user}</span>
                    {log.userEmail && (
                      <span className="text-slate-400 font-mono text-[10px]">({log.userEmail})</span>
                    )}
                    {log.userRole && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                          log.userRole === 'admin'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {log.userRole}
                      </span>
                    )}
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
