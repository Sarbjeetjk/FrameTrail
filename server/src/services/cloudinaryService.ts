import cloudinary from '../config/cloudinary';

export class CloudinaryService {
  /**
   * Upload file (Base64 data URI or URL) directly to Cloudinary cloud storage
   */
  static async uploadMedia(fileDataUri: string, folder: string = 'frametrail', resourceType: 'auto' | 'image' | 'video' = 'auto') {
    try {
      const result = await cloudinary.uploader.upload(fileDataUri, {
        folder: `frametrail/${folder}`,
        resource_type: resourceType,
        overwrite: true,
        invalidate: true,
      });

      console.log(`[Cloudinary Service] Uploaded ${resourceType} to Cloudinary: ${result.secure_url}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        bytes: result.bytes,
      };
    } catch (error: any) {
      console.error('[Cloudinary Upload Error]', error);
      throw new Error(error.message || 'Failed to upload media to Cloudinary');
    }
  }
}
