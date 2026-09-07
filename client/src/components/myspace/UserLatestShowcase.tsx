import React, { useState } from 'react';
import { IMediaItem } from '../../types';
import { UploadCloud, Sparkles, Eye, Play, ShieldCheck, Heart, Calendar, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserLatestShowcaseProps {
  items: IMediaItem[];
  onOpenUpload: () => void;
}

export const UserLatestShowcase: React.FC<UserLatestShowcaseProps> = ({ items, onOpenUpload }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  // If user has not posted any media yet
  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border-2 border-dashed border-indigo-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-5 animate-in fade-in duration-500">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating Empty Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10 animate-bounce">
          <UploadCloud className="w-10 h-10" />
        </div>

        {/* Empty Notice Text */}
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Not Posted Any Media Yet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Your Personal Showcase is Empty!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            You haven't posted any photos or videos to your vault yet. Click the button below to open the upload form and publish your first media!
          </p>
        </div>

        {/* Big Upload CTA Button */}
        <div>
          <button
            onClick={onOpenUpload}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Post First Media (Open Form)</span>
          </button>
        </div>
      </div>
    );
  }

  // If user has posted media: Showcase the user's own latest uploads
  const latestItem = items[slideIndex % items.length];

  return (
    <div className="relative bg-slate-900 border-2 border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 space-y-4 p-5 sm:p-6 animate-in fade-in duration-500">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-wider uppercase">
                Your Latest Upload Showcase
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Personal Media
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Featuring your own latest {items.length} {items.length === 1 ? 'post' : 'posts'} in the personal showcase
            </p>
          </div>
        </div>

        {/* Thumbnail Selector Dots */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {items.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === slideIndex ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Item #${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero Card of User's Media */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 aspect-[21/9] min-h-[220px] max-h-[360px] flex items-center justify-center group">
        {latestItem.type === 'photo' ? (
          <img
            src={latestItem.url}
            alt={latestItem.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full relative">
            <video
              src={latestItem.url}
              poster={latestItem.metadata?.thumbnailUrl}
              className="w-full h-full object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-6 h-6 fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md border border-indigo-400/30 flex items-center gap-1.5 shadow-lg">
            {latestItem.type === 'photo' ? <ImageIcon className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
            <span>{latestItem.type}</span>
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-black/70 text-slate-200 backdrop-blur-md border border-white/10">
            {latestItem.category}
          </span>
        </div>

        {/* Bottom Details */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-indigo-500/30 text-white">
          <div className="space-y-0.5 max-w-md">
            <h3 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{latestItem.title}</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {new Date(latestItem.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                {latestItem.likes || 0} Likes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to={`/media/${latestItem._id}`}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Full Asset</span>
            </Link>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Post More</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
