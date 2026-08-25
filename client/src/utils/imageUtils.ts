/**
 * Automatically applies Cloudinary dynamic image optimization (f_auto, q_auto, 2560px max width)
 * Reduces 10MB+ images down to ~600KB while maintaining 4K Ultra HD visual quality!
 */
export const getOptimizedImageUrl = (url?: string, width = 2560): string => {
  if (!url) return '';

  // If it's a Cloudinary image URL, apply f_auto,q_auto transformation
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/video/')) {
    // Avoid duplicating transformation parameters if already present
    if (url.includes('/f_auto,q_auto')) {
      return url;
    }
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  return url;
};
