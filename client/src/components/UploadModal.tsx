import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, Film, Camera, Video, Link as LinkIcon, Youtube, Trash2, Plus, FileText } from 'lucide-react';
import { usePresignedUpload } from '../hooks/usePresignedUpload';
import { MediaService } from '../services/mediaService';
import { useMedia } from '../hooks/useMedia';
import { MediaType } from '../types';
import api from '../services/api';
import { getVideoPlayerInfo } from '../utils/videoUtils';

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
  category: string;
  customCategory: string;
  tags: string;
  customTags: string;
  previewUrl: string;
  thumbnailFile?: File | null;
}

interface BatchLinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  customCategory: string;
  tags: string;
  customTags: string;
  thumbnailFile?: File | null;
}

// 📌 TYPE-SPECIFIC CATEGORY & TAG OPTIONS
const photoCategoryList = [
  'New Delhi',
  'Jaipur',
  'Himachal',
  'Solan',
  'Rajgir',
  'Punjab',
  'Vrindavan',
  'Mathura',
  'Mumbai',
  'Varanasi',
  'Goa',
  'Kashmir',
  'Kolkata',
  'Nature & Landscapes',
  'Architecture & Landmarks',
  'Street Photography',
];

const videoCategoryList = [
  'Short Film',
  'VFX & Animation',
  'Drone Footage',
  'Nature & Wildlife Clip',
  'Cyberpunk Reels',
  'Documentary Reel',
  'Travel Vlog',
  'Music Video',
  'Campus & Event Reels',
];

const movieCategoryList = [
  'Action & Adventure',
  'Sci-Fi & Fantasy',
  'Thriller & Mystery',
  'Drama & Romance',
  'Comedy',
  'Horror',
  'Animation & VFX Movie',
  'Documentary Film',
  'Bollywood & Indian Cinema',
  'Hollywood Blockbuster',
];

const photoTagList = [
  '4K Ultra HD',
  'Solan',
  'SViet',
  'Campus',
  'College',
  'Cultural Heritage',
  'Night & Neon',
  'Portraits & Fine Art',
  'Travel & Heritage',
];

const videoTagList = [
  '1080p 60fps',
  '4K Cinematic',
  'Slow Motion',
  'VFX Reel',
  'Aerial Shot',
  'Color Graded',
  'HDR Stream',
];

const movieTagList = [
  'Full HD 1080p',
  '4K Mastered',
  'Dolby Atmos',
  'Trailer & Preview',
  'Subtitled',
  'Uncut Release',
  'Cinematic Cut',
];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { uploadFile, uploading, progress, error: r2Error, resetUploadState } = usePresignedUpload();
  const { fetchMedia } = useMedia();

  // Mode Selection: 'file' (Local Batch File Upload) vs 'url' (Direct Link / YouTube Link)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [type, setType] = useState<MediaType>('photo');

  // Compute active category & tag options depending on current asset type
  const activeCategoryList =
    type === 'photo' ? photoCategoryList : type === 'video' ? videoCategoryList : movieCategoryList;
  const activeTagList =
    type === 'photo' ? photoTagList : type === 'video' ? videoTagList : movieTagList;

  // Multiple File Batch Selection State
  const [fileList, setFileList] = useState<BatchFileItem[]>([]);

  // Multi-Link Selection State for URL Mode
  const [urlList, setUrlList] = useState<BatchLinkItem[]>([
    {
      id: '1',
      url: '',
      title: '',
      description: '',
      category: photoCategoryList[0],
      customCategory: '',
      tags: photoTagList[0],
      customTags: '',
      thumbnailFile: null,
    },
  ]);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');

  // Custom Cover / Poster Thumbnail Image File State (for Video and Movie file uploads)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Dynamic Categories list fetched from MongoDB Atlas
  const [categoryOptions, setCategoryOptions] = useState<string[]>(photoCategoryList);

  // Category Dropdown State with Other custom input
  const [categorySelect, setCategorySelect] = useState(photoCategoryList[0]);
  const [customCategory, setCustomCategory] = useState('');

  // Tag Dropdown State with Other custom input
  const [tagSelect, setTagSelect] = useState(photoTagList[0]);
  const [customTag, setCustomTag] = useState('');

  // Submission Progress States
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [customError, setCustomError] = useState<string | null>(null);

  // When asset type changes, update default category & tag selections
  React.useEffect(() => {
    const categories = getCategoriesForType(type);
    const tags = getTagsForType(type);
    setCategorySelect(categories[0]);
    setTagSelect(tags[0]);
  }, [type]);

  function getCategoriesForType(t: MediaType) {
    return t === 'photo' ? photoCategoryList : t === 'video' ? videoCategoryList : movieCategoryList;
  }

  function getTagsForType(t: MediaType) {
    return t === 'photo' ? photoTagList : t === 'video' ? videoTagList : movieTagList;
  }

  // Fetch all existing categories from MongoDB Atlas on mount / modal open
  React.useEffect(() => {
    const fetchDynamicCategories = async () => {
      try {
        const res = await MediaService.getCategories();
        if (res.success && res.data) {
          const fetchedNames = res.data.map((c) => c._id).filter(Boolean);
          const currentDefaults = getCategoriesForType(type);
          const combined = Array.from(new Set([...currentDefaults, ...fetchedNames]));
          setCategoryOptions(combined);
        }
      } catch (err) {
        console.error('[Fetch Dynamic Categories Error]', err);
      }
    };
    if (isOpen) {
      fetchDynamicCategories();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  // Handle Multiple File Selection
  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const currentCats = getCategoriesForType(type);
      const currentTags = getTagsForType(type);

      const newItems: BatchFileItem[] = selectedFiles.map((file, idx) => ({
        id: `${Date.now()}_${idx}`,
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        category: currentCats[0],
        customCategory: '',
        tags: currentTags[0],
        customTags: '',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        thumbnailFile: null,
      }));
      setFileList((prev) => [...prev, ...newItems]);
    }
  };

  const removeBatchItem = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBatchItemField = (id: string, field: keyof BatchFileItem, value: any) => {
    setFileList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // 🔗 Multi-Link Batch Helpers
  const addLinkRow = () => {
    const currentCats = getCategoriesForType(type);
    const currentTags = getTagsForType(type);
    setUrlList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        url: '',
        title: '',
        description: '',
        category: currentCats[0],
        customCategory: '',
        tags: currentTags[0],
        customTags: '',
        thumbnailFile: null,
      },
    ]);
  };

  const removeLinkRow = (id: string) => {
    if (urlList.length <= 1) {
      const currentCats = getCategoriesForType(type);
      const currentTags = getTagsForType(type);
      setUrlList([
        {
          id: Date.now().toString(),
          url: '',
          title: '',
          description: '',
          category: currentCats[0],
          customCategory: '',
          tags: currentTags[0],
          customTags: '',
          thumbnailFile: null,
        },
      ]);
      return;
    }
    setUrlList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLinkRow = (id: string, field: keyof BatchLinkItem, value: any) => {
    setUrlList((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleBulkPasteApply = () => {
    if (!bulkPasteText.trim()) return;
    const lines = bulkPasteText.split('\n').map((l) => l.trim()).filter(Boolean);
    const currentCats = getCategoriesForType(type);
    const currentTags = getTagsForType(type);

    const newItems: BatchLinkItem[] = lines.map((url, idx) => ({
      id: `${Date.now()}_${idx}`,
      url,
      title: `${type === 'photo' ? 'Photo' : type === 'video' ? 'Video' : 'Movie'} Link ${urlList.length + idx + (urlList[0]?.url ? 1 : 0)}`,
      description: '',
      category: currentCats[0],
      customCategory: '',
      tags: currentTags[0],
      customTags: '',
      thumbnailFile: null,
    }));
    if (urlList.length === 1 && !urlList[0].url.trim()) {
      setUrlList(newItems);
    } else {
      setUrlList((prev) => [...prev, ...newItems]);
    }
    setBulkPasteText('');
    setShowBulkPaste(false);
  };

  // Convert File to Base64 String with Smart Image Compression
  const fileToBase64 = (file: File, maxDimension: number = 2560, quality: number = 0.88): Promise<string> => {
    return new Promise((resolve, reject) => {
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
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/webp';
        const dataUrl = canvas.toDataURL(mimeType, quality);
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
      // Default global fallback category & tags
      const globalCategory = categorySelect === 'Other' ? (customCategory.trim() || 'Custom') : categorySelect;
      const rawGlobalTag = tagSelect === 'Other' ? customTag : tagSelect;
      const globalTagArray = rawGlobalTag
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (uploadMode === 'url') {
        // 🔗 MULTI-LINK BATCH URL MODE
        const validLinks = urlList.filter((item) => item.url.trim());
        if (validLinks.length === 0) {
          throw new Error('Please enter at least one valid URL or YouTube/Google Drive link!');
        }

        for (let i = 0; i < validLinks.length; i++) {
          if (!validLinks[i].title.trim()) {
            throw new Error(`Please enter a title for Link #${i + 1}!`);
          }
        }

        for (let i = 0; i < validLinks.length; i++) {
          const item = validLinks[i];
          setCurrentUploadIndex(i + 1);

          // Compute Item Category
          const itemCategory =
            item.category === 'Other'
              ? (item.customCategory.trim() || 'Custom')
              : (item.category || globalCategory);

          // Compute Item Tags
          let itemTagArray: string[] = [];
          if (item.tags === 'Other') {
            itemTagArray = item.customTags
              ? item.customTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
              : globalTagArray;
          } else if (item.tags) {
            itemTagArray = [item.tags.trim().toLowerCase()];
          } else {
            itemTagArray = globalTagArray;
          }

          // Upload custom thumbnail cover image if selected for this link
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

          await MediaService.createMedia({
            title: item.title.trim(),
            description: item.description.trim(),
            type,
            url: item.url.trim(),
            r2Key: `external_link_${Date.now()}_${i}`,
            category: itemCategory,
            tags: itemTagArray,
            metadata: {
              mimeType: type === 'photo' ? 'image/jpeg' : 'video/mp4',
              fileSize: 0,
              resolution: type === 'photo' ? '3840x2160' : '1920x1080',
              thumbnailUrl: itemThumbnailUrl || undefined,
            },
          });
        }
      } else {
        // 📁 MULTIPLE FILE BATCH UPLOAD PIPELINE
        if (fileList.length === 0) {
          throw new Error('Please select at least one file to upload!');
        }

        for (let i = 0; i < fileList.length; i++) {
          const item = fileList[i];
          setCurrentUploadIndex(i + 1);

          // Compute Item Category
          const itemCategory =
            item.category === 'Other'
              ? (item.customCategory.trim() || 'Custom')
              : (item.category || globalCategory);

          // Compute Item Tags
          let itemTagArray: string[] = [];
          if (item.tags === 'Other') {
            itemTagArray = item.customTags
              ? item.customTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
              : globalTagArray;
          } else if (item.tags) {
            itemTagArray = [item.tags.trim().toLowerCase()];
          } else {
            itemTagArray = globalTagArray;
          }

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

          await MediaService.createMedia({
            title: item.title || item.file.name,
            description: item.description,
            type,
            url: finalMediaUrl,
            r2Key: mediaR2Key,
            category: itemCategory,
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
    const defaultCats = getCategoriesForType(type);
    const defaultTags = getTagsForType(type);
    setUrlList([
      {
        id: '1',
        url: '',
        title: '',
        description: '',
        category: defaultCats[0],
        customCategory: '',
        tags: defaultTags[0],
        customTags: '',
        thumbnailFile: null,
      },
    ]);
    setCategorySelect(defaultCats[0]);
    setCustomCategory('');
    setTagSelect(defaultTags[0]);
    setCustomTag('');
    setSubmitSuccess(false);
    setCustomError(null);
    onClose();
  };

  const getButtonLabel = () => {
    if (submitting || uploading) {
      if (uploadMode === 'url') {
        const count = urlList.filter((i) => i.url.trim()).length;
        return count > 1
          ? `Saving Link ${currentUploadIndex} of ${count}...`
          : 'Saving Media Link...';
      }
      return fileList.length > 1
        ? `Uploading File ${currentUploadIndex} of ${fileList.length}...`
        : 'Uploading Media Asset...';
    }
    if (uploadMode === 'url') {
      const count = urlList.filter((i) => i.url.trim()).length;
      if (count > 1) {
        return `Save All ${count} ${type === 'photo' ? 'Photo Links' : type === 'video' ? 'Video Links' : 'Movie Links'}`;
      }
      return type === 'photo' ? 'Save Photo Link' : 'Save Video / Movie Link';
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                                  Title for File #{index + 1}
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="File title"
                                  value={item.title}
                                  onChange={(e) => updateBatchItemField(item.id, 'title', e.target.value)}
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
                                  onChange={(e) => updateBatchItemField(item.id, 'description', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                                />
                              </div>
                            </div>

                            {/* Specific Category & Tag Dropdowns for File */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  {type === 'photo' ? 'Location / Category' : 'Genre / Category'}
                                </label>
                                <select
                                  value={item.category || activeCategoryList[0]}
                                  onChange={(e) => updateBatchItemField(item.id, 'category', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                >
                                  {activeCategoryList.map((cat) => (
                                    <option key={cat} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                                  <option value="Other">Other (Specify Custom Category)...</option>
                                </select>

                                {item.category === 'Other' && (
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter custom category..."
                                    value={item.customCategory || ''}
                                    onChange={(e) => updateBatchItemField(item.id, 'customCategory', e.target.value)}
                                    className="w-full mt-1.5 bg-slate-900 border border-indigo-500/50 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 animate-in fade-in"
                                  />
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                                  Specific Tag Dropdown
                                </label>
                                <select
                                  value={item.tags || activeTagList[0]}
                                  onChange={(e) => updateBatchItemField(item.id, 'tags', e.target.value)}
                                  className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                >
                                  {activeTagList.map((tag) => (
                                    <option key={tag} value={tag}>
                                      {tag}
                                    </option>
                                  ))}
                                  <option value="Other">Other (Type Custom Tags)...</option>
                                </select>

                                {item.tags === 'Other' && (
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter custom tags (e.g. Solan, 4K)..."
                                    value={item.customTags || ''}
                                    onChange={(e) => updateBatchItemField(item.id, 'customTags', e.target.value)}
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
                                      onClick={() => updateBatchItemField(item.id, 'thumbnailFile', null)}
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
                                      updateBatchItemField(item.id, 'thumbnailFile', e.target.files[0]);
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
                /* 🔗 MULTI-LINK SELECTOR MODE FOR ALL ASSETS */
                <div className="space-y-4">
                  {/* Top Multi-Link Control Action Bar */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Multi-Link Selector ({urlList.length} {urlList.length === 1 ? 'Link' : 'Links'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkPaste(!showBulkPaste)}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-indigo-400" /> Bulk Paste
                      </button>

                      <button
                        type="button"
                        onClick={addLinkRow}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
                      >
                        <Plus className="w-3 h-3" /> Add Link
                      </button>
                    </div>
                  </div>

                  {/* Bulk Paste Drawer */}
                  {showBulkPaste && (
                    <div className="p-3.5 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-2 animate-in fade-in">
                      <label className="block text-xs font-bold text-indigo-300">
                        Paste Multiple URLs (One URL per line):
                      </label>
                      <textarea
                        rows={3}
                        placeholder={`e.g.\nhttps://drive.google.com/file/d/...\nhttps://youtu.be/...\nhttps://vimeo.com/...`}
                        value={bulkPasteText}
                        onChange={(e) => setBulkPasteText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-medium"
                      ></textarea>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBulkPaste(false)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkPasteApply}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md"
                        >
                          Apply Pasted Links
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scrollable Container for Link Item Cards */}
                  <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1">
                    {urlList.map((linkItem, index) => (
                      <div
                        key={linkItem.id}
                        className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3 relative group hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-extrabold flex items-center justify-center border border-indigo-500/40">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {type === 'photo' ? 'Photo Link' : type === 'video' ? 'Video Link' : 'Movie Link'} #{index + 1}
                            </span>
                          </div>

                          {urlList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLinkRow(linkItem.id)}
                              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                              title="Remove this link entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* URL Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Paste URL / Stream Link <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="url"
                            required
                            placeholder={
                              type === 'photo'
                                ? 'e.g. https://images.unsplash.com/photo-...'
                                : 'e.g. Google Drive link, YouTube, Vimeo, or direct stream URL'
                            }
                            value={linkItem.url}
                            onChange={(e) => updateLinkRow(linkItem.id, 'url', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-semibold"
                          />
                          {linkItem.url.trim() && type !== 'photo' && (() => {
                            const info = getVideoPlayerInfo(linkItem.url);
                            return (
                              <div className="flex items-center gap-2 pt-1">
                                {info.type === 'drive' && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                    ✓ Google Drive Video Detected (Auto-Embedded)
                                  </span>
                                )}
                                {info.type === 'youtube' && (
                                  <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                                    ✓ YouTube Stream Detected (Auto-Embedded)
                                  </span>
                                )}
                                {info.type === 'vimeo' && (
                                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                                    ✓ Vimeo Stream Detected (Auto-Embedded)
                                  </span>
                                )}
                                {info.type === 'iframe' && (
                                  <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold">
                                    ✓ External Iframe / Embed Player Detected
                                  </span>
                                )}
                                {info.type === 'direct' && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                    ✓ Direct File / Stream URL
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Specific Title & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Title for Link #{index + 1} <span className="text-rose-400">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Asset title"
                              value={linkItem.title}
                              onChange={(e) => updateLinkRow(linkItem.id, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">
                              Description (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Asset description"
                              value={linkItem.description}
                              onChange={(e) => updateLinkRow(linkItem.id, 'description', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                            />
                          </div>
                        </div>

                        {/* Specific Category / Location & Tag Dropdowns per Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {/* Category / Location Dropdown */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">
                              {type === 'photo' ? 'Location / Category' : 'Genre / Category'}
                            </label>
                            <select
                              value={linkItem.category || activeCategoryList[0]}
                              onChange={(e) => updateLinkRow(linkItem.id, 'category', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                            >
                              {activeCategoryList.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                              <option value="Other">Other (Specify Custom Category)...</option>
                            </select>

                            {linkItem.category === 'Other' && (
                              <input
                                type="text"
                                required
                                placeholder="Enter custom category..."
                                value={linkItem.customCategory || ''}
                                onChange={(e) => updateLinkRow(linkItem.id, 'customCategory', e.target.value)}
                                className="w-full mt-1.5 bg-slate-900 border border-indigo-500/50 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 animate-in fade-in"
                              />
                            )}
                          </div>

                          {/* Specific Tag Dropdown */}
                          <div>
                            <label className="block text-[11px] font-bold text-indigo-300 mb-1">
                              Specific Tag Dropdown
                            </label>
                            <select
                              value={linkItem.tags || activeTagList[0]}
                              onChange={(e) => updateLinkRow(linkItem.id, 'tags', e.target.value)}
                              className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                            >
                              {activeTagList.map((tag) => (
                                <option key={tag} value={tag}>
                                  {tag}
                                </option>
                              ))}
                              <option value="Other">Other (Type Custom Tags)...</option>
                            </select>

                            {linkItem.tags === 'Other' && (
                              <input
                                type="text"
                                required
                                placeholder="Enter custom tags (e.g. Solan, 4K, Action)..."
                                value={linkItem.customTags || ''}
                                onChange={(e) => updateLinkRow(linkItem.id, 'customTags', e.target.value)}
                                className="w-full mt-1.5 bg-slate-900 border border-indigo-500/60 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-indigo-500 animate-in fade-in"
                              />
                            )}
                          </div>
                        </div>

                        {/* Optional Custom Cover Image File for Video and Movie Links */}
                        {(type === 'video' || type === 'movie') && (
                          <div className="pt-2 border-t border-slate-900">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                                <Camera className="w-3.5 h-3.5 text-amber-400" />
                                <span>Upload Custom Poster/Cover Image for Link #{index + 1} (Optional)</span>
                              </label>
                              {linkItem.thumbnailFile && (
                                <button
                                  type="button"
                                  onClick={() => updateLinkRow(linkItem.id, 'thumbnailFile', null)}
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
                                  updateLinkRow(linkItem.id, 'thumbnailFile', e.target.files[0]);
                                }
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                            />
                            {linkItem.thumbnailFile && (
                              <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 pt-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Selected Cover: {linkItem.thumbnailFile.name}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Progress Bar */}
              {(uploading || submitting) && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span>
                      {uploadMode === 'url'
                        ? `Saving Link ${currentUploadIndex} of ${urlList.filter((i) => i.url.trim()).length}...`
                        : fileList.length > 1
                        ? `Uploading Batch File ${currentUploadIndex} of ${fileList.length}...`
                        : type === 'movie'
                        ? 'Uploading heavy movie to R2...'
                        : 'Uploading to Cloud...'}
                    </span>
                    <span>{type === 'movie' && uploadMode === 'file' ? `${progress}%` : 'Processing...'}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 transition-all duration-200"
                      style={{
                        width:
                          uploadMode === 'url'
                            ? `${(currentUploadIndex / Math.max(urlList.filter((i) => i.url.trim()).length, 1)) * 100}%`
                            : fileList.length > 1
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
                    (uploadMode === 'url' && urlList.filter((item) => item.url.trim() && item.title.trim()).length === 0)
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
