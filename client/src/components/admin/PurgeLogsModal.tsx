import React from 'react';
import { Lock, ShieldAlert, KeyRound, Loader2, X } from 'lucide-react';

interface PurgeLogsModalProps {
  isOpen: boolean;
  deleteTarget: any;
  password: string;
  setPassword: (pw: string) => void;
  error: string | null;
  verifying: boolean;
  onClose: () => void;
  onConfirm: (e: React.FormEvent) => void;
}

export const PurgeLogsModal: React.FC<PurgeLogsModalProps> = ({
  isOpen,
  deleteTarget,
  password,
  setPassword,
  error,
  verifying,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isAll = deleteTarget === 'all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-black text-white">
              {isAll ? 'Clear System Activity Logs' : 'Delete Single Activity Log Entry'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-medium space-y-1">
          <div className="font-extrabold flex items-center gap-1.5 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Admin Authorization Required</span>
          </div>
          <p>
            {isAll
              ? 'Security policy requires Admin Password authorization to clear activity audit logs.'
              : `Confirm permanent deletion of log entry "${deleteTarget?.event || 'LOG_ENTRY'}".`}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-900/60 border border-rose-500 rounded-xl text-rose-200 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={onConfirm} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Enter Admin Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="Enter admin password to authorize..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Authorize &amp; Delete</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
