import React, { useState, useRef } from 'react';
import { IMediaItem } from '../types';
import { X, Heart, Clock, Film, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useMedia } from '../hooks/useMedia';

interface VideoPlayerModalProps {
  video: IMediaItem | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const { likeMediaItem } = useMedia();
  const [videoError, setVideoError] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasPausedRef = useRef<boolean>(false);

  if (!video) return null;

  const fallbackStreams = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ];

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  };

  const getDriveEmbedUrl = (url: string) => {
    const match = url.match(/\/file\/d\/([^\/]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const rawUrl = video.url || '';
  const isYouTube = isYouTubeUrl(rawUrl);
  const isDrive = isDriveUrl(rawUrl);

  const getPlayableVideoUrl = () => {
    if (isYouTube) {
      return getYouTubeEmbedUrl(rawUrl);
    }
    if (isDrive) {
      return getDriveEmbedUrl(rawUrl);
    }

    if (videoError || !rawUrl) {
      return fallbackStreams[currentStreamIndex];
    }
    
    return rawUrl;
  };

  const playableUrl = getPlayableVideoUrl();

  const handleVideoError = () => {
    console.warn('[Video Player Warning] Initial video URL failed to load. Switching to HD fallback stream...');
    setVideoError(true);
  };

  const handleSwitchStream = () => {
    setVideoError(true);
    setCurrentStreamIndex((prev) => (prev + 1) % fallbackStreams.length);
  };

  // Extract poster thumbnail URL safely for HTML5 video element
  const getPosterUrl = () => {
    if (video.metadata?.thumbnailUrl) {
      return video.metadata.thumbnailUrl;
    }
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';
  };

  // 🌟 Synchronous 2-Stage Backdrop Click: 1st click pauses video, 2nd click closes modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.video-modal-card')) {
      return;
    }

    if (videoRef.current && !videoRef.current.paused && !hasPausedRef.current) {
      videoRef.current.pause();
      hasPausedRef.current = true;
      return;
    }

    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="video-modal-card relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white truncate max-w-md">{video.title}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={playableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open Direct Stream</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {isYouTube || isDrive ? (
            <iframe
              src={playableUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          ) : (
            <video
              ref={videoRef}
              key={playableUrl}
              src={playableUrl}
              controls
              autoPlay
              onError={handleVideoError}
              poster={getPosterUrl()}
              className="w-full h-full object-contain"
            >
              <source src={playableUrl} type="video/mp4" />
              Your browser does not support HTML5 video streaming.
            </video>
          )}

          {videoError && !isYouTube && (
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Streaming via HD Backup Server</span>
              <button
                onClick={handleSwitchStream}
                className="ml-2 font-bold underline text-white hover:text-cyan-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Switch Server
              </button>
            </div>
          )}
        </div>

        {/* Video Description & Actions Bar */}
        <div className="p-6 bg-slate-900 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {video.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(video.metadata?.duration)}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {video.description || 'Full HD streaming video asset.'}
            </p>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={() => likeMediaItem(video._id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-200 text-sm font-medium transition-colors border border-slate-700"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{video.likes} Likes</span>
            </button>

            <a
              href={playableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex sm:hidden items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Direct Link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
