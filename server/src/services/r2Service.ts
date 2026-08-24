import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, IS_R2_CONFIGURED } from '../config/r2';
import { env } from '../config/env';

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  r2Key: string;
}

export class R2Service {
  /**
   * Generates a presigned PUT URL for direct client-side upload to Cloudflare R2
   */
  static async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'media'
  ): Promise<PresignedUrlResult> {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `${folder}/${timestamp}_${sanitizedFileName}`;

    if (!IS_R2_CONFIGURED) {
      console.log(`[R2 Service Simulation] Generating simulated presigned URL for key: ${r2Key}`);
      return {
        uploadUrl: `http://localhost:${env.PORT}/api/upload/simulated-upload?key=${encodeURIComponent(r2Key)}`,
        publicUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        r2Key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: env.R2.BUCKET_NAME,
      Key: r2Key,
      ContentType: contentType,
    });

    // Presigned URL valid for 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    const publicUrl = env.R2.PUBLIC_DOMAIN
      ? `${env.R2.PUBLIC_DOMAIN}/${r2Key}`
      : `https://${env.R2.BUCKET_NAME}.${env.R2.ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Key}`;

    return {
      uploadUrl,
      publicUrl,
      r2Key,
    };
  }

  /**
   * Generates a presigned GET download URL (optional for private buckets)
   */
  static async getPresignedDownloadUrl(r2Key: string): Promise<string> {
    if (!IS_R2_CONFIGURED) {
      return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;
    }

    const command = new GetObjectCommand({
      Bucket: env.R2.BUCKET_NAME,
      Key: r2Key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Deletes an object from Cloudflare R2 storage
   */
  static async deleteObject(r2Key: string): Promise<boolean> {
    if (!r2Key) return false;
    if (!IS_R2_CONFIGURED) {
      console.log(`[R2 Service Simulation] Simulating object deletion for key: ${r2Key}`);
      return true;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: env.R2.BUCKET_NAME,
        Key: r2Key,
      });
      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error(`[R2 Delete Error] Failed to delete key ${r2Key}:`, error);
      return false;
    }
  }
}
