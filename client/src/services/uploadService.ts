import { api } from './api';
import axios from 'axios';
import { ApiResponse } from '../types';

export interface PresignedResponse {
  uploadUrl: string;
  publicUrl: string;
  r2Key: string;
}

export class UploadService {
  /**
   * Request presigned URL from backend
   */
  static async getPresignedUrl(
    fileName: string,
    contentType: string,
    folder: string = 'gallery'
  ): Promise<ApiResponse<PresignedResponse>> {
    const response = await api.post('/upload/presigned-url', {
      fileName,
      contentType,
      folder,
    });
    return response.data;
  }

  /**
   * Directly upload file binary to Cloudflare R2 using presigned PUT URL
   */
  static async uploadFileToR2(
    presignedUrl: string,
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  }
}
