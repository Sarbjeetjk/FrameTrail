import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IMediaItem } from '../types';
import { MediaService } from '../services/mediaService';
import { useMedia } from '../hooks/useMedia';
import { Trash2, Edit3, Eye, EyeOff, Heart, Camera, Video, Film, AlertTriangle, RotateCcw, ChevronLeft, ChevronRight, CheckSquare, Square, Loader2 } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface AdminTableProps {
  items: IMediaItem[];
  isTrashView?: boolean;
  onRefresh: () => void;
  onSoftDelete?: (item: IMediaItem) => void;
  onRestore?: (item: IMediaItem) => void;
  onToggleHide?: (item: IMediaItem) => void;
  onPermanentDelete?: (id: string) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  items,
  isTrashView = false,
  onRefresh,
  onSoftDelete,
  onRestore,
  onToggleHide,
  onPermanentDelete,
}) => {
  const { fetchMedia } = useMedia();
  const [editingItem, setEditingItem] = useState<IMediaItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editType, setEditType] = useState<any>('photo');

  // Multi-Select Checkbox State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // Fast Client-Side Table Pagination for 0ms Rendering Performance
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Reset selection & page when items change
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [items.length, isTrashView]);

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Action Execution Handlers
  const handleBulkSoftDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to move ${selectedIds.length} selected assets to the Trash Bin?`)) return;
    
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        const item = items.find((i) => i._id === id);
        if (item && onSoftDelete) {
          await onSoftDelete(item);
        } else {
          await MediaService.deleteMedia(id);
        }
      }
      setSelectedIds([]);
      onRefresh();
      fetchMedia();
    } catch (err) {
      console.error('[Bulk Soft Delete Error]', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        const item = items.find((i) => i._id === id);
        if (item && onRestore) {
          await onRestore(item);
        } else {
          await MediaService.restoreMedia(id);
        }
      }
      setSelectedIds([]);
      onRefresh();
      fetchMedia();
    } catch (err) {
      console.error('[Bulk Restore Error]', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkToggleHide = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        const item = items.find((i) => i._id === id);
        if (item && onToggleHide) {
          await onToggleHide(item);
        } else {
          await MediaService.toggleHideItem(id);
        }
      }
      setSelectedIds([]);
      onRefresh();
      fetchMedia();
    } catch (err) {
      console.error('[Bulk Toggle Hide Error]', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkPurge = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`⚠️ CAUTION: Permanently delete ${selectedIds.length} assets from cloud database? This action CANNOT be undone!`)) return;
    
    setIsBulkProcessing(true);
    try {
      for (const id of selectedIds) {
        if (onPermanentDelete) {
          await onPermanentDelete(id);
        } else {
          await MediaService.purgeMedia(id);
        }
      }
      setSelectedIds([]);
      onRefresh();
      fetchMedia();
    } catch (err) {
      console.error('[Bulk Purge Error]', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteConfirm = async (id: string) => {
    if (isTrashView && onPermanentDelete) {
      onPermanentDelete(id);
    } else if (onSoftDelete) {
      const targetItem = items.find((i) => i._id === id);
      if (targetItem) {
        onSoftDelete(targetItem);
      }
    } else {
      try {
        await MediaService.deleteMedia(id);
        onRefresh();
        fetchMedia();
      } catch (err) {
        console.error('[Delete Error]', err);
      }
    }
    setDeletingId(null);
  };

  const startEdit = (item: IMediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditCustomCategory(item.category);
    setEditType(item.type);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await MediaService.updateMedia(editingItem._id, {
        title: editTitle,
        category: editCategory,
        type: editType,
      });
      setEditingItem(null);
      onRefresh();
      fetchMedia();
    } catch (err) {
      console.error('[Update Error]', err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2">
          {isTrashView ? <Trash2 className="w-6 h-6 text-rose-400" /> : <Eye className="w-6 h-6 text-indigo-400" />}
        </div>
        <div className="font-bold text-base text-white">
          {isTrashView ? 'Trash Bin is Empty' : 'No Media Assets Found'}
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {isTrashView ? 'Deleted assets will appear here before permanent removal.' : 'No assets match the selected filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0 relative">
      
      {/* 🌟 Bulk Action Toolbar for Multi-Select Checkboxes */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/95 border-b border-indigo-500/30 p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-white animate-in fade-in backdrop-blur-md">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-extrabold">{selectedIds.length} Assets Selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white underline text-xs font-semibold ml-2"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isBulkProcessing ? (
              <div className="flex items-center gap-2 text-indigo-300 font-bold px-3 py-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Processing Multi-Select Request...</span>
              </div>
            ) : isTrashView ? (
              <>
                <button
                  onClick={handleBulkRestore}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                  title="Restore selected assets to active gallery"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Selected ({selectedIds.length})</span>
                </button>
                <button
                  onClick={handleBulkPurge}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                  title="Permanently purge selected assets"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Selected ({selectedIds.length})</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkToggleHide}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                  title="Toggle privacy status for selected assets"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Toggle Privacy ({selectedIds.length})</span>
                </button>
                <button
                  onClick={handleBulkSoftDelete}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                  title="Move selected assets to trash bin"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Move Selected to Trash ({selectedIds.length})</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-xs font-black text-indigo-300 uppercase tracking-wider">
              {/* Checkbox Select All Column */}
              <th className="py-4 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 accent-indigo-600 cursor-pointer"
                  title="Select All Assets"
                />
              </th>
              <th className="py-4 px-5">Asset Info</th>
              <th className="py-4 px-5">Type</th>
              <th className="py-4 px-5">Category / City</th>
              <th className="py-4 px-5">Views / Likes</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs text-slate-200 font-medium">
            {paginatedItems.map((item) => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <tr key={item._id} className={`transition-colors ${isSelected ? 'bg-indigo-950/40' : 'hover:bg-slate-800/50'}`}>
                  {/* Row Checkbox Selection */}
                  <td className="py-3.5 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(item._id)}
                      className="w-4 h-4 rounded border-slate-700 accent-indigo-600 cursor-pointer"
                    />
                  </td>

                  {/* Asset info & preview */}
                  <td className="py-3.5 px-5 flex items-center gap-3 min-w-[240px]">
                  <img
                    src={getOptimizedImageUrl(item.url, 300)}
                    alt={item.title}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-950 border border-slate-700 flex-shrink-0"
                  />
                  <div className="truncate">
                    <div className="font-extrabold text-white text-sm truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{item._id}</div>
                  </div>
                </td>

                {/* Type Badge */}
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-indigo-300 border border-slate-700 capitalize">
                    {item.type === 'photo' && <Camera className="w-3.5 h-3.5 text-indigo-400" />}
                    {item.type === 'video' && <Video className="w-3.5 h-3.5 text-violet-400" />}
                    {item.type === 'movie' && <Film className="w-3.5 h-3.5 text-amber-400" />}
                    {item.type}
                  </span>
                </td>

                {/* Category */}
                <td className="py-3.5 px-5 font-bold text-indigo-300">{item.category}</td>

                {/* Views & Likes */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-200 font-bold">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> {item.views}
                    </span>
                    <span className="flex items-center gap-1 text-slate-200 font-bold">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {item.likes}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isTrashView ? (
                      <>
                        {/* Restore Button */}
                        <button
                          onClick={() => onRestore && onRestore(item)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition-all font-bold text-xs flex items-center gap-1.5"
                          title="Restore to Active Gallery"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        {/* Permanent Delete Button */}
                        <button
                          onClick={() => setDeletingId(item._id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/40 transition-all font-bold text-xs flex items-center gap-1.5"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/media/${item._id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600/30 text-cyan-400 hover:text-white border border-slate-700 transition-colors"
                          title="View Asset Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {item.isHidden ? (
                          <button
                            onClick={async () => {
                              if (onToggleHide) {
                                onToggleHide(item);
                              } else {
                                try {
                                  await MediaService.toggleHideItem(item._id);
                                  onRefresh();
                                  fetchMedia();
                                } catch (err) {
                                  console.error('[Unhide Error]', err);
                                }
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                            title="Unhide and publish back to public gallery"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Unhide</span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (onToggleHide) {
                                onToggleHide(item);
                              } else {
                                try {
                                  await MediaService.toggleHideItem(item._id);
                                  onRefresh();
                                  fetchMedia();
                                } catch (err) {
                                  console.error('[Hide Error]', err);
                                }
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors"
                            title="Hide Asset from Public Gallery"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-slate-700 transition-colors"
                          title="Edit Item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item._id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-400 hover:text-rose-200 border border-slate-700 transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
          <div>
            Showing <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="text-white">{Math.min(currentPage * pageSize, items.length)}</span> of{' '}
            <span className="text-indigo-400">{items.length}</span> items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {isTrashView ? 'Delete Permanently?' : 'Move to Trash Bin?'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {isTrashView
                ? 'This action cannot be undone. The media asset will be permanently deleted from MongoDB and Cloudflare R2.'
                : 'Asset will be moved to Trash Bin. You can restore it anytime or delete it permanently later.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-600/30"
              >
                {isTrashView ? 'Permanently Delete' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Media Details</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                {editingItem.type}
              </span>
            </div>

            {/* Media Image / Thumbnail Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-40 flex items-center justify-center shadow-inner">
              <img
                src={editingItem.url}
                alt={editingItem.title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-3">
                <div className="truncate text-xs">
                  <div className="font-extrabold text-white truncate">{editingItem.title}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">{editingItem.url}</div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const finalCategory = editCategory === 'Other' ? editCustomCategory : editCategory;
                if (!editingItem) return;
                MediaService.updateMedia(editingItem._id, {
                  title: editTitle,
                  category: finalCategory,
                  type: editType,
                })
                  .then(() => {
                    setEditingItem(null);
                    onRefresh();
                    fetchMedia();
                  })
                  .catch((err) => console.error('[Update Error]', err));
              }}
              className="space-y-4 text-xs font-medium"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category / City</label>
                <select
                  value={
                    ['New Delhi', 'Jaipur', 'Himachal', 'Rajgir', 'Punjab', 'Vrindavan', 'Mathura', 'Mumbai', 'Varanasi', 'Goa', 'Kashmir', 'Kolkata'].includes(editCategory)
                      ? editCategory
                      : 'Other'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setEditCustomCategory(editCategory);
                      setEditCategory('Other');
                    } else {
                      setEditCategory(val);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Himachal">Himachal</option>
                  <option value="Rajgir">Rajgir</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Vrindavan">Vrindavan</option>
                  <option value="Mathura">Mathura</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Varanasi">Varanasi</option>
                  <option value="Goa">Goa</option>
                  <option value="Kashmir">Kashmir</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Other">Other (Specify Custom Category)...</option>
                </select>

                {(editCategory === 'Other' ||
                  !['New Delhi', 'Jaipur', 'Himachal', 'Rajgir', 'Punjab', 'Vrindavan', 'Mathura', 'Mumbai', 'Varanasi', 'Goa', 'Kashmir', 'Kolkata'].includes(
                    editCategory
                  )) && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category..."
                    value={editCustomCategory}
                    onChange={(e) => {
                      setEditCustomCategory(e.target.value);
                      setEditCategory('Other');
                    }}
                    className="w-full mt-2.5 bg-indigo-950/60 border border-indigo-500/50 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400 font-semibold"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
