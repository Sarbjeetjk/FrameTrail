import { Request, Response } from 'express';
import { R2Service } from '../services/r2Service';
import { CloudinaryService } from '../services/cloudinaryService';
import { sendResponse, sendError } from '../utils/response';

export class UploadController {
  /**
   * Upload file directly to Cloudinary (For Photos & Videos)
   */
  static async uploadToCloudinary(req: Request, res: Response) {
    try {
      const { fileDataUri, folder, resourceType } = req.body;

      if (!fileDataUri) {
        return sendError(res, 400, 'fileDataUri is required');
      }

      const result = await CloudinaryService.uploadMedia(
        fileDataUri,
        folder || 'photos',
        resourceType || 'auto'
      );

      return sendResponse(
        res,
        200,
        true,
        'File uploaded to Cloudinary cloud successfully',
        result
      );
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to upload to Cloudinary');
    }
  }

  /**
   * Request a Cloudflare R2 Presigned Upload PUT URL (For Heavy Movies)
   */
  static async getPresignedUrl(req: Request, res: Response) {
    try {
      const { fileName, contentType, folder } = req.body;

      if (!fileName || !contentType) {
        return sendError(res, 400, 'fileName and contentType are required');
      }

      const result = await R2Service.getPresignedUploadUrl(
        fileName,
        contentType,
        folder || 'gallery'
      );

      return sendResponse(
        res,
        200,
        true,
        'Presigned upload URL generated successfully',
        result
      );
    } catch (error: any) {
      return sendError(res, 500, error.message || 'Failed to generate presigned upload URL');
    }
  }

  /**
   * Simulated local upload handler (used when real R2 credentials are not set up)
   */
  static async handleSimulatedUpload(req: Request, res: Response) {
    const key = (req.query.key as string) || 'uploads/sample.jpg';
    return res.status(200).json({
      success: true,
      message: 'Simulated file upload complete',
      key,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    });
  }
}
