import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Film, Camera, Video, Link as LinkIcon, Youtube, Trash2, Plus, FileText } from 'lucide-react';
import { usePresignedUpload } from '../hooks/usePresignedUpload';
import { MediaService } from '../services/mediaService';
import { useMedia } from '../hooks/useMedia';
import { MediaType } from '../types';
import api from '../services/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BatchFileItem {
  id: string;
  file: File;
  title: string;
  description: string;
  tags: string;
  previewUrl: string;
  thumbnailFile?: File | null;
}

const defaultCategoriesList = [
  'New Delhi',
  'Jaipur',
  'Himachal',
  'Rajgir',
  'Punjab',
  'Vrindavan',
  'Mathura',
  'Mumbai',
  'Varanasi',
  'Goa',
  'Kashmir',
  'Kolkata',
];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { uploadFile, uploading, progress, error: r2Error, resetUploadState } = usePresignedUpload();
  const { fetchMedia } = useMedia();

  // Mode Selection: 'file' (Local Batch File Upload) vs 'url' (Direct Link / YouTube Link)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [type, setType] = useState<MediaType>('photo');

  // Multiple File Batch Selection State
  const [fileList, setFileList] = useState<BatchFileItem[]>([]);

  // Custom Cover / Poster Thumbnail Image File State (for Video and Movie file uploads)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Single Direct Link State
  const [mediaUrl, setMediaUrl] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleDescription, setSingleDescription] = useState('');

  // Dynamic Categories list fetched from MongoDB Atlas
  const [categoryOptions, setCategoryOptions] = useState<string[]>(defaultCategoriesList);

  // Category Dropdown State with Other custom input
  const [categorySelect, setCategorySelect] = useState('New Delhi');
  const [customCategory, setCustomCategory] = useState('');

  // Tag Dropdown State with Other custom input
  const [tagSelect, setTagSelect] = useState('4K Ultra HD');
  const [customTag, setCustomTag] = useState('');

  // Submission Progress States
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [customError, setCustomError] = useState<string | null>(null);

  // Fetch all existing categories from MongoDB Atlas on mount / modal open
  React.useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const res = await MediaService.getCategories();
        if (res.success && res.data) {
          const fetchedNames = res.data.map((c) => c._id).filter(Boolean);
          const combined = Array.from(new Set([...defaultCategoriesList, ...fetchedNames]));
          setCategoryOptions(combined);
        }
      } catch (err) {
        console.error('[Fetch Dynamic Categories Error]', err);
      }
    };
    if (isOpen) {
      fetchDynamicCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Multiple File Selection with instant Image Preview URL generation
  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newBatchItems: BatchFileItem[] = selectedFiles.map((file, index) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const isImage = file.type.startsWith('image/');
        return {
          id: `${file.name}_${Date.now()}_${index}`,
          file,
          title: formattedTitle,
          description: '',
          tags: '',
          previewUrl: isImage ? URL.createObjectURL(file) : '',
        };
      });

      setFileList((prev) => [...prev, ...newBatchItems]);
    }
  };

  const updateBatchItemTitle = (id: string, newTitle: string) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item))
    );
  };

  const updateBatchItemDescription = (id: string, newDesc: string) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, description: newDesc } : item))
    );
  };

  const updateBatchItemTags = (id: string, newTags: string) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, tags: newTags } : item))
    );
  };

  const updateBatchItemThumbnail = (id: string, thumbFile: File | null) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, thumbnailFile: thumbFile } : item))
    );
  };

  const removeBatchItem = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  // Smart Canvas Image Compression Helper (88% Quality Factor with 4K max resolution scaling)
  const fileToBase64 = (file: File, quality = 0.88, maxDimension = 2560): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If not an image file (e.g. video/mp4), return raw Data URI
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;

        // Proportional 4K scaling if image dimensions exceed 2560px
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw FileReader if canvas context fails
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export to WebP / JPEG with 0.88 (88%) quality factor
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/webp';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        const originalMb = (file.size / (1024 * 1024)).toFixed(2);
        const approxCompressedMb = ((dataUrl.length * 0.75) / (1024 * 1024)).toFixed(2);
        console.log(`[Smart Image Compression] ${file.name}: ${originalMb} MB -> ~${approxCompressedMb} MB (${Math.round(width)}x${Math.round(height)}) @ 88% Quality`);

        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (readErr) => reject(readErr);
      };

      img.src = objectUrl;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setCustomError(null);
    setCurrentUploadIndex(0);

    try {
      // Compute final category & tags
      const finalCategory = categorySelect === 'Other' ? (customCategory.trim() || 'Custom') : categorySelect;
      const rawTagString = tagSelect === 'Other' ? customTag : tagSelect;
      const tagArray = rawTagString
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (uploadMode === 'url') {
        // 🔗 SINGLE DIRECT URL / YOUTUBE LINK MODE
        if (!mediaUrl.trim()) {
          throw new Error('Please enter a valid URL or YouTube link!');
        }
        if (!singleTitle.trim()) {
          throw new Error('Please enter a title for the media item!');
        }

        await MediaService.createMedia({
          title: singleTitle.trim(),
          description: singleDescription.trim(),
          type,
          url: mediaUrl.trim(),
          r2Key: `external_link_${Date.now()}`,
          category: finalCategory,
          tags: tagArray,
          metadata: {
            mimeType: type === 'photo' ? 'image/jpeg' : 'video/mp4',
            fileSize: 0,
            resolution: type === 'photo' ? '3840x2160' : '1920x1080',
          },
        });
      } else {
        // 📁 MULTIPLE FILE BATCH UPLOAD PIPELINE
        if (fileList.length === 0) {
          throw new Error('Please select at least one file to upload!');
        }

        for (let i = 0; i < fileList.length; i++) {
          const item = fileList[i];
          setCurrentUploadIndex(i + 1);

          // Upload individual custom cover image if selected for this specific file
          let itemThumbnailUrl = '';
          const targetThumbFile = item.thumbnailFile || thumbnailFile;
          if (targetThumbFile) {
            const thumbBase64 = await fileToBase64(targetThumbFile);
            const thumbRes = await api.post('/upload/cloudinary', {
              fileDataUri: thumbBase64,
              folder: 'thumbnails',
              resourceType: 'image',
            });
            if (thumbRes.data && thumbRes.data.data && thumbRes.data.data.url) {
              itemThumbnailUrl = thumbRes.data.data.url;
            }
          }

          let finalMediaUrl = '';
          let mediaR2Key = '';

          // 🌟 CLOUDINARY UPLOAD PIPELINE FOR ALL MEDIA TYPES (Photo, Video & Movie)
          const base64Uri = await fileToBase64(item.file);
          const cloudRes = await api.post('/upload/cloudinary', {
            fileDataUri: base64Uri,
            folder: type === 'photo' ? 'photos' : type === 'video' ? 'videos' : 'movies',
            resourceType: type === 'photo' ? 'image' : 'video',
          });

          if (cloudRes.data && cloudRes.data.data && cloudRes.data.data.url) {
            finalMediaUrl = cloudRes.data.data.url;
            mediaR2Key = cloudRes.data.data.publicId || `cloudinary_${type}_${Date.now()}_${i}`;
          } else {
            throw new Error(`Cloudinary upload failed for file: ${item.file.name}`);
          }

          // Compute item specific tags array or fallback to shared tag option
          const itemTagArray = item.tags && item.tags.trim()
            ? item.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
            : tagArray;

          // Save batch item to MongoDB Atlas
          await MediaService.createMedia({
            title: item.title || item.file.name,
            description: item.description,
            type,
            url: finalMediaUrl,
            r2Key: mediaR2Key,
            category: finalCategory,
            tags: itemTagArray,
            metadata: {
              mimeType: item.file.type,
              fileSize: item.file.size,
              resolution: type === 'photo' ? '3840x2160' : '1920x1080',
              thumbnailUrl: itemThumbnailUrl || undefined,
            },
          });
        }
      }

      setSubmitSuccess(true);
      fetchMedia();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('[Batch Submit Upload Error]', err);
      setCustomError(err.message || 'Upload failed. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetUploadState();
    setFileList([]);
    setMediaUrl('');
    setSingleTitle('');
    setSingleDescription('');
    setCategorySelect('New Delhi');
    setCustomCategory('');
    setTagSelect('4K Ultra HD');
    setCustomTag('');
    setSubmitSuccess(false);
    setCustomError(null);
    onClose();
  };

  const getButtonLabel = () => {
    if (submitting || uploading) {
      return fileList.length > 1
        ? `Uploading File ${currentUploadIndex} of ${fileList.length}...`
        : 'Uploading Media Asset...';
    }
    if (uploadMode === 'url') {
      return type === 'photo' ? 'Save Photo Link' : 'Save Video / Stream Link';
    }
    if (fileList.length > 1) {
      return `Upload All ${fileList.length} ${type === 'photo' ? 'Photos' : type === 'video' ? 'Videos' : 'Movies'}`;
    }
    return `Upload ${type === 'photo' ? 'Photo' : type === 'video' ? 'Video' : 'Movie'}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Glow Ambient Light */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <UploadCloud className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Upload Media Assets</h2>
              <p className="text-xs text-slate-400 font-medium">
                Supports Batch Multiple File Uploads & Link Stream Sharing
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative z-10 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {submitSuccess ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                {fileList.length > 1 ? `All ${fileList.length} Assets Uploaded Successfully!` : 'Asset Saved Successfully!'}
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium leading-relaxed">
                Media records saved directly online to your MongoDB Atlas database.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
              >
                Done & View Gallery
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Upload Mode Pill Switcher */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    uploadMode === 'file'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Batch File Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    uploadMode === 'url'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Paste URL / YouTube Link</span>
                </button>
              </div>

              {/* Asset Type Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Select Asset Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('photo')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'photo'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-400" /> Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('video')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'video'
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-violet-400" /> Short Video
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('movie')}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'movie'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" /> Movie / Stream
                  </button>
                </div>
              </div>

              {/* Upload Input Area */}
              {uploadMode === 'file' ? (
                <div className="space-y-3">
                  {/* File Dropzone Input (Supports MULTIPLE selection) */}
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-950/80 group">
                    <input
                      type="file"
                      id="multi-file-upload"
                      className="hidden"
                      multiple
                      onChange={handleMultipleFileChange}
                      accept={type === 'photo' ? 'image/*' : 'video/*'}
                    />
                    <label htmlFor="multi-file-upload" className="cursor-pointer space-y-2 block">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                        <Plus className="w-4 h-4 text-indigo-400" />
                        <span>Choose Multiple {type === 'photo' ? 'Photos' : type === 'video' ? 'Videos' : 'Movies'}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Select multiple files at once. You can customize Title & Description for each file.
                      </p>
                    </label>
                  </div>

                  {/* Batch Selected Files Cards List with Individual Title & Desc */}
                  {fileList.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Selected Files Batch ({fileList.length})</span>
                        <button
                          type="button"
                          onClick={() => setFileList([])}
                          className="text-rose-400 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {fileList.map((item, index) => (
                          <div
                            key={item.id}
                            className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 animate-in fade-in"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                              <div className="flex items-center gap-3 truncate">
                                <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                  {index + 1}
                                </span>

                                {/* 🌟 Small Thumbnail Image / Video Preview */}
                                {item.previewUrl ? (
                                  <img
                                    src={item.previewUrl}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-xl border border-slate-700/80 shadow-md flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                    <Video className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="truncate">
                                  <div className="font-bold text-slate-200 truncate text-xs">{item.file.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeBatchItem(item.id)}
                                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Title for File #{index + 1}
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="File title"
                                  value={item.title}
                                  onChange={(e) => updateBatchItemTitle(item.id, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Description (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="File description"
                                  value={item.description}
                                  onChange={(e) => updateBatchItemDescription(item.id, e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                                  Tags (Specific for File)
                                </label>
                                <select
                                  value={item.tags.startsWith('custom:') ? 'custom' : (item.tags || '4K Ultra HD')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'custom') {
                                      updateBatchItemTags(item.id, 'custom:');
                                    } else {
                                      updateBatchItemTags(item.id, val);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                >
                                  <option value="4K Ultra HD">4K Ultra HD</option>
                                  <option value="Solan">Solan</option>
                                  <option value="SViet">SViet</option>
                                  <option value="Campus">Campus</option>
                                  <option value="College">College</option>
                                  <option value="Cultural Heritage">Cultural Heritage</option>
                                  <option value="Architecture & Landmarks">Architecture & Landmarks</option>
                                  <option value="Nature & Landscapes">Nature & Landscapes</option>
                                  <option value="Street Photography">Street Photography</option>
                                  <option value="Portraits & Fine Art">Portraits & Fine Art</option>
                                  <option value="Night & Neon">Night & Neon</option>
                                  <option value="custom">Other (Type Custom Tags)...</option>
                                </select>

                                {item.tags.startsWith('custom:') && (
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter custom tags (e.g. Solan, 4K)..."
                                    value={item.tags.replace('custom:', '')}
                                    onChange={(e) => updateBatchItemTags(item.id, `custom:${e.target.value}`)}
                                    className="w-full mt-1.5 bg-slate-900 border border-indigo-500/60 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 animate-in fade-in"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Dedicated Cover Thumbnail Image File Section for this specific file */}
                            {(type === 'video' || type === 'movie') && (
                              <div className="pt-2 border-t border-slate-900">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Upload Cover Thumbnail Image for File #{index + 1} (Optional)</span>
                                  </label>
                                  {item.thumbnailFile && (
                                    <button
                                      type="button"
                                      onClick={() => updateBatchItemThumbnail(item.id, null)}
                                      className="text-[10px] text-rose-400 font-bold hover:underline"
                                    >
                                      Remove Image
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      updateBatchItemThumbnail(item.id, e.target.files[0]);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                                />
                                {item.thumbnailFile && (
                                  <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 pt-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Selected Cover Image: {item.thumbnailFile.name} ({(item.thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single URL Input Mode */
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-slate-300 font-bold flex items-center gap-1.5">
                      {type === 'photo' ? (
                        <>
                          <Camera className="w-4 h-4 text-indigo-400" />
                          <span>Paste Photo Link / Direct Image URL</span>
                        </>
                      ) : (
                        <>
                          <Youtube className="w-4 h-4 text-rose-500" />
                          <span>Paste Video URL / YouTube Live Stream Link</span>
                        </>
                      )}
                    </label>
                    <input
                      type="url"
                      required
                      placeholder={
                        type === 'photo'
                          ? 'e.g. https://images.unsplash.com/photo-...'
                          : 'e.g. https://www.youtube.com/watch?v=live_id or https://youtu.be/...'
                      }
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                    />
                    <p className="text-[11px] text-slate-400 font-medium">
                      {type === 'photo'
                        ? 'Supports Unsplash, Pinterest, JPG, PNG & direct image links.'
                        : 'Supports YouTube Videos, Live Streams, Vimeo & MP4 video streams.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Asset Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter title"
                      value={singleTitle}
                      onChange={(e) => setSingleTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Description (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Brief description..."
                      value={singleDescription}
                      onChange={(e) => setSingleDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Shared Category Metadata Controls */}
              <div className="pt-1">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category / Location</label>
                  <select
                    value={categorySelect}
                    onChange={(e) => setCategorySelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other (Specify Custom Category)...</option>
                  </select>

                  {categorySelect === 'Other' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full mt-2 bg-slate-950 border border-indigo-500/50 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 animate-in fade-in"
                    />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {uploadMode === 'file' && (uploading || submitting) && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span>
                      {fileList.length > 1
                        ? `Uploading Batch File ${currentUploadIndex} of ${fileList.length}...`
                        : type === 'movie'
                        ? 'Uploading heavy movie to R2...'
                        : 'Uploading to Cloud...'}
                    </span>
                    <span>{type === 'movie' ? `${progress}%` : 'Processing...'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 transition-all duration-200"
                      style={{
                        width:
                          fileList.length > 1
                            ? `${(currentUploadIndex / fileList.length) * 100}%`
                            : type === 'movie'
                            ? `${progress}%`
                            : '100%',
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {(r2Error || customError) && (
                <div className="p-3.5 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{r2Error || customError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    uploading ||
                    (uploadMode === 'file' && fileList.length === 0) ||
                    (uploadMode === 'url' && (!mediaUrl || !singleTitle))
                  }
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{getButtonLabel()}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
