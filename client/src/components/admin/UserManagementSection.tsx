import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface UserManagementSectionProps {
  registeredUsers: any[];
  onManageRole: (userName: string) => void;
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  registeredUsers,
  onManageRole,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-white">System User Accounts & Administrator Team</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage registered accounts and role privileges</p>
        </div>
        <span className="px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold rounded-full">
          {registeredUsers.length} Registered Accounts
        </span>
      </div>

      <div className="space-y-3">
        {registeredUsers.map((u) => (
          <div
            key={u._id || u.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm uppercase">
                {u.name ? u.name[0] : 'U'}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>{u.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      u.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {u.role === 'admin' ? 'Super Admin' : 'User Member'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
              <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Account
              </span>
              <button
                type="button"
                onClick={() => onManageRole(u.name)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
              >
                Manage Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
