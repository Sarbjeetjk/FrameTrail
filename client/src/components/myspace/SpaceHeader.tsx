import React from 'react';
import { UploadCloud, Shield } from 'lucide-react';
import { IUser } from '../../types';
import { UserAvatar } from '../UserAvatar';

interface SpaceHeaderProps {
  user: IUser | null;
  onOpenUpload: () => void;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({ user, onOpenUpload }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={user?.name}
            avatar={user?.avatar}
            size="xl"
            showOnlineBadge={true}
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user?.name}'s Personal Space
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-400" /> Private Vault
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Isolated private storage &mdash; only visible to you. Securely upload photos & reels.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload to My Space</span>
        </button>
      </div>
    </div>
  );
};
