import React from 'react';
import { ShieldCheck, AlertCircle, Loader2, X } from 'lucide-react';

interface UnhidePasswordModalProps {
  unhideTarget: any;
  password: string;
  setPassword: (pw: string) => void;
  error: string | null;
  verifying: boolean;
  onClose: () => void;
  onConfirm: (e: React.FormEvent) => void;
}

export const UnhidePasswordModal: React.FC<UnhidePasswordModalProps> = ({
  unhideTarget,
  password,
  setPassword,
  error,
  verifying,
  onClose,
  onConfirm,
}) => {
  if (!unhideTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Admin Password Required</h3>
              <p className="text-[11px] text-slate-400">Enter Admin Password to unhide asset & publish to gallery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onConfirm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
              <span>Enter Password for:</span>
              <span className="text-amber-300 truncate max-w-[200px]">
                {unhideTarget.type === 'item' ? unhideTarget.item?.title : unhideTarget.categoryName}
              </span>
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter Admin Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={verifying || !password.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify &amp; Unhide</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
