/**
 * Helper utility to parse and normalize video & movie URLs (Google Drive, YouTube, Vimeo, Direct Streams, Iframe Embeds)
 */

export interface VideoPlayerInfo {
  type: 'youtube' | 'drive' | 'vimeo' | 'iframe' | 'direct';
  embedUrl: string;
  isEmbed: boolean;
  originalUrl: string;
}

/**
 * Extract Google Drive file ID from various Drive URL patterns
 */
export const extractDriveFileId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // Pattern 1: /file/d/FILE_ID/
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  return null;
};

/**
 * Extract YouTube video ID from various YouTube URL patterns
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  // Pattern 1: youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0]?.split('#')[0];
    if (id) return id;
  }

  // Pattern 2: youtube.com/shorts/VIDEO_ID
  if (url.includes('/shorts/')) {
    const id = url.split('/shorts/')[1]?.split('?')[0]?.split('#')[0];
    if (id) return id;
  }

  // Pattern 3: youtube.com/embed/VIDEO_ID
  if (url.includes('/embed/')) {
    const id = url.split('/embed/')[1]?.split('?')[0]?.split('#')[0];
    if (id) return id;
  }

  // Pattern 4: youtube.com/watch?v=VIDEO_ID
  const vParam = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (vParam && vParam[1]) return vParam[1];

  return null;
};

/**
 * Extract Vimeo Video ID
 */
export const extractVimeoVideoId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  return match ? match[1] : null;
};

/**
 * Determine player details and construct iframe embed URLs for all video sources
 */
export const getVideoPlayerInfo = (url: string): VideoPlayerInfo => {
  const cleanUrl = (url || '').trim();

  // 1. Google Drive
  if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
    const driveId = extractDriveFileId(cleanUrl);
    if (driveId) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
        isEmbed: true,
        originalUrl: cleanUrl,
      };
    }
    // If drive URL is already preview link
    if (cleanUrl.includes('/preview')) {
      return {
        type: 'drive',
        embedUrl: cleanUrl,
        isEmbed: true,
        originalUrl: cleanUrl,
      };
    }
  }

  // 2. YouTube
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    const ytId = extractYouTubeVideoId(cleanUrl);
    if (ytId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
        isEmbed: true,
        originalUrl: cleanUrl,
      };
    }
  }

  // 3. Vimeo
  if (cleanUrl.includes('vimeo.com')) {
    const vimeoId = extractVimeoVideoId(cleanUrl);
    if (vimeoId) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        isEmbed: true,
        originalUrl: cleanUrl,
      };
    }
  }

  // 4. Check if it's a direct HTML5 video file (.mp4, .webm, .m3u8, .mov, Cloudinary/R2 raw video)
  const isDirectVideoFile =
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.m3u8') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.includes('/video/upload/') ||
    cleanUrl.includes('cloudinary.com') ||
    cleanUrl.includes('r2.dev');

  if (isDirectVideoFile) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      isEmbed: false,
      originalUrl: cleanUrl,
    };
  }

  // 5. Stream hosting providers (hdstream4u, doodstream, streamtape, vidoza, etc.)
  let embedUrl = cleanUrl;
  if (cleanUrl.includes('/file/')) {
    embedUrl = cleanUrl.replace('/file/', '/embed/');
  } else if (cleanUrl.includes('/f/')) {
    embedUrl = cleanUrl.replace('/f/', '/e/');
  }

  return {
    type: 'iframe',
    embedUrl,
    isEmbed: true,
    originalUrl: cleanUrl,
  };
};
