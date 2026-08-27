import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MediaService } from '../services/mediaService';
import { IMediaItem } from '../types';
import { useMedia } from '../hooks/useMedia';
import { ArrowLeft, Eye, Heart, Download, HardDrive, Tag, ExternalLink, Play } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getVideoPlayerInfo } from '../utils/videoUtils';

export const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { likeMediaItem } = useMedia();
  const [item, setItem] = useState<IMediaItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Media Asset Not Found</h2>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">
          Return to Gallery
        </Link>
      </div>
    );
  }

  const [forceMode, setForceMode] = useState<'iframe' | 'direct' | 'auto'>('auto');

  const playerInfo = getVideoPlayerInfo(item.url);
  const isEmbedPlayer = forceMode === 'iframe' || (forceMode === 'auto' && playerInfo.isEmbed);

  const renderMediaContent = () => {
    if (item.type === 'photo') {
      return (
        <img
          src={getOptimizedImageUrl(item.url, 2560)}
          alt={item.title}
          className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl"
        />
      );
    }

    if (isEmbedPlayer) {
      return (
        <div className="w-full space-y-3">
          {/* Prominent 1-Click Stream Play Bar */}
          <div className="p-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-xs font-extrabold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HD MOVIE STREAM READY ({playerInfo.type.toUpperCase()})</span>
            </div>

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-violet-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>CLICK TO PLAY / WATCH FULL MOVIE STREAM</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative aspect-video max-h-[70vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
            {/* Embedded Iframe Player with Sandbox Permissions */}
            <iframe
              src={playerInfo.embedUrl}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              allowFullScreen
              className="w-full h-full border-0 bg-black"
            ></iframe>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400">
            <span>Stream Provider: <strong className="text-indigo-300 font-mono">{item.url}</strong></span>
            <span>If frame click is unresponsive, click green button above ↗</span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-3">
        <video
          src={item.url}
          controls
          autoPlay
          onError={() => setForceMode('iframe')}
          className="w-full aspect-video max-h-[70vh] rounded-2xl shadow-2xl bg-black"
        >
          <source src={item.url} type="video/mp4" />
          Your browser does not support HTML5 video playback.
        </video>

        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs font-bold text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-amber-400">If video fails to load in HTML5 player:</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForceMode('iframe')}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline"
            >
              Switch to Stream Frame Player (Iframe)
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
            >
              Open Link <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Gallery Showcase
      </Link>

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-3">
        {/* Media Container */}
        <div className="lg:col-span-2 bg-slate-950 flex items-center justify-center p-6 min-h-[400px]">
          {renderMediaContent()}
        </div>

        {/* Info Column */}
        <div className="p-8 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {item.category}
            </span>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">{item.title}</h1>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.description}</p>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-indigo-600" /> Views</span>
                <span className="font-bold text-slate-900">{item.views}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> Likes</span>
                <span className="font-bold text-slate-900">{item.likes}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-cyan-600" /> Asset Reference Key</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">{item.r2Key || 'r2/object.jpg'}</span>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">Tags:</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => likeMediaItem(item._id)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Like Asset
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Download className="w-4 h-4" /> Download Asset
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
