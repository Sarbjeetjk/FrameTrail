import React from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { IMediaItem } from '../../types';
import { AdminTable } from '../AdminTable';

interface HiddenVaultSectionProps {
  hiddenCategoriesList: string[];
  filteredCategoryNames: string[];
  filteredHiddenMediaItems: IMediaItem[];
  onToggleHideCategory: (categoryName: string) => void;
  onRefresh: () => void;
  onSoftDelete: (item: IMediaItem) => void;
  onRestore: (item: IMediaItem) => void;
  onToggleHideItem: (item: IMediaItem) => void;
}

export const HiddenVaultSection: React.FC<HiddenVaultSectionProps> = ({
  hiddenCategoriesList,
  filteredCategoryNames,
  filteredHiddenMediaItems,
  onToggleHideCategory,
  onRefresh,
  onSoftDelete,
  onRestore,
  onToggleHideItem,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Category Lock Management Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Category Privacy Controls Board</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            Hidden Categories: <strong className="text-amber-400">{hiddenCategoriesList.length}</strong>
          </span>
        </div>

        {filteredCategoryNames.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-semibold">
            No categories found matching filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCategoryNames.map((categoryName) => {
              const isCategoryHidden = hiddenCategoriesList.includes(categoryName);
              return (
                <div
                  key={categoryName}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                    isCategoryHidden
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{categoryName}</span>
                      {isCategoryHidden && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase border border-amber-500/30">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleHideCategory(categoryName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isCategoryHidden
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isCategoryHidden ? 'Unhide' : 'Hide Category'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden Media Assets Table View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Hidden Media Assets ({filteredHiddenMediaItems.length})</span>
          </h3>
        </div>

        <AdminTable
          items={filteredHiddenMediaItems}
          isTrashView={false}
          onRefresh={onRefresh}
          onSoftDelete={onSoftDelete}
          onRestore={onRestore}
          onToggleHide={onToggleHideItem}
        />
      </div>
    </div>
  );
};
