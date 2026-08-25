import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MediaService } from '../services/mediaService';
import { IMediaItem } from '../types';
import { useMedia } from '../hooks/useMedia';
import { ArrowLeft, Eye, Heart, Download, HardDrive, Tag } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

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
          {item.type === 'photo' ? (
            <img src={getOptimizedImageUrl(item.url, 2560)} alt={item.title} className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-2xl" />
          ) : (
            <video src={item.url} controls autoPlay className="w-full max-h-[70vh] rounded-2xl">
              Your browser does not support HTML5 video.
            </video>
          )}
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
