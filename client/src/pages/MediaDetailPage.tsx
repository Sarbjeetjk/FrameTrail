import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MediaService } from '../services/mediaService';
import { IMediaItem } from '../types';
import { useMedia } from '../hooks/useMedia';
import {
  ArrowLeft,
  Eye,
  Heart,
  Download,
  HardDrive,
  ExternalLink,
  Play,
  User,
  ShieldCheck,
  Calendar,
  Camera,
  Video,
  Film,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getVideoPlayerInfo } from '../utils/videoUtils';

export const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { likeMediaItem } = useMedia();
  const [item, setItem] = useState<IMediaItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [forceMode, setForceMode] = useState<'iframe' | 'direct' | 'auto'>('auto');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await MediaService.getMediaById(id);
        if (res.success && res.data) {
          setItem(res.data);
        }
      } catch (err) {
        console.error('[Detail Load Error]', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-6 w-32 bg-slate-800/80 rounded-xl animate-pulse"></div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-3 animate-pulse">
          <div className="lg:col-span-2 bg-slate-950 min-h-[460px] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-800/60"></div>
          </div>
          <div className="p-8 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50">
            <div className="h-6 w-24 bg-slate-800 rounded-full"></div>
            <div className="h-10 w-3/4 bg-slate-800 rounded-xl"></div>
            <div className="h-20 w-full bg-slate-800/60 rounded-xl"></div>
            <div className="h-32 w-full bg-slate-800/40 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-500/10">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Media Asset Not Found</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The media asset you are looking for may have been deleted, marked private, or the link is invalid.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Gallery Showcase
        </Link>
      </div>
    );
  }

  const playerInfo = getVideoPlayerInfo(item.url || '');
  const isEmbedPlayer = forceMode === 'iframe' || (forceMode === 'auto' && playerInfo.isEmbed);

  // Determine uploader details
  const uploader =
    typeof item.uploadedBy === 'object' && item.uploadedBy
      ? item.uploadedBy
      : { name: 'Admin / System', role: 'admin', email: '' };
  const isUserUploader = uploader.role === 'user';

  const renderMediaContent = () => {
    if (item.type === 'photo') {
      return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={getOptimizedImageUrl(item.url, 2560)}
            alt={item.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </div>
      );
    }

    if (isEmbedPlayer) {
      return (
        <div className="w-full space-y-3 p-4">
          {/* Prominent Stream Header Bar */}
          <div className="p-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HD STREAM READY ({playerInfo.type.toUpperCase()})</span>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>OPEN FULL STREAM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative aspect-video max-h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
            <iframe
              src={playerInfo.embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              allowFullScreen
              className="w-full h-full border-0 bg-black"
            ></iframe>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-400">
            <span className="truncate max-w-[280px]">
              Stream Source: <strong className="text-indigo-300 font-mono">{item.url}</strong>
            </span>
            <button
              type="button"
              onClick={() => setForceMode('direct')}
              className="text-cyan-400 hover:underline text-[11px] font-bold shrink-0 ml-2"
            >
              Switch to Direct Video Player
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-3 p-4">
        <video
          src={item.url}
          controls
          autoPlay
          onError={() => setForceMode('iframe')}
          className="w-full aspect-video max-h-[75vh] rounded-2xl shadow-2xl bg-black"
        >
          <source src={item.url} type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold text-slate-400 bg-slate-900/90 rounded-xl border border-slate-800">
          <span className="text-amber-400 text-[11px]">If video fails to play in HTML5 player:</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForceMode('iframe')}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline text-[11px]"
            >
              Switch to Stream Frame Player
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1 text-[11px]"
            >
              Open Direct File <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" /> Back to Gallery
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all shadow-md"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{copied ? 'Link Copied! ✓' : 'Share Link'}</span>
        </button>
      </div>

      {/* Main Showcase Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-3">
        
        {/* Media Player / Viewer Viewport */}
        <div className="lg:col-span-2 bg-slate-950 flex items-center justify-center min-h-[440px] relative border-b lg:border-b-0 lg:border-r border-slate-800">
          {renderMediaContent()}
        </div>

        {/* Media Details & Actions Sidebar */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-900 text-white">
          <div className="space-y-4">
            
            {/* Type & Category Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm">
                {item.type === 'photo' && <Camera className="w-3.5 h-3.5 text-indigo-400" />}
                {item.type === 'video' && <Video className="w-3.5 h-3.5 text-violet-400" />}
                {item.type === 'movie' && <Film className="w-3.5 h-3.5 text-amber-400" />}
                <span>{item.type}</span>
              </span>

              <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-800/80 text-cyan-300 border border-slate-700">
                {item.category}
              </span>
            </div>

            {/* Asset Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                {item.title}
              </h1>
              {item.description && (
                <p className="text-xs text-slate-400 leading-relaxed font-medium mt-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* 👤 Uploader Profile Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center gap-3 shadow-inner">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                  isUserUploader
                    ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                    : 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {uploader.avatar ? (
                  <img src={uploader.avatar} alt={uploader.name} className="w-full h-full object-cover rounded-xl" />
                ) : isUserUploader ? (
                  <User className="w-5 h-5 text-indigo-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Uploaded By
                </div>
                <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <span>{uploader.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      isUserUploader
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isUserUploader ? 'User' : 'Admin'}
                  </span>
                </div>
                {uploader.email && (
                  <div className="text-[10px] text-slate-400 font-mono truncate">{uploader.email}</div>
                )}
              </div>
            </div>

            {/* Metadata Stats */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-medium">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" /> Total Views
                </span>
                <span className="font-bold text-white font-mono">{item.views}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Total Likes
                </span>
                <span className="font-bold text-white font-mono">{item.likes}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Published On
                </span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-violet-400" /> Reference ID
                </span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]" title={item._id}>
                  {item._id}
                </span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 text-indigo-300 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => likeMediaItem(item._id)}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Like Asset ({item.likes})</span>
            </button>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res Asset</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
