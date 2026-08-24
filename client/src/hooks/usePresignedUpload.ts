import { useState } from 'react';
import { UploadService, PresignedResponse } from '../services/uploadService';

export const usePresignedUpload = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PresignedResponse | null>(null);

  const uploadFile = async (file: File, folder: string = 'gallery'): Promise<PresignedResponse | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Step 1: Obtain Cloudflare R2 Presigned Upload URL from API
      const presignedRes = await UploadService.getPresignedUrl(file.name, file.type, folder);

      if (!presignedRes.success || !presignedRes.data) {
        throw new Error(presignedRes.message || 'Failed to get presigned upload URL');
      }

      const { uploadUrl, publicUrl, r2Key } = presignedRes.data;

      // Step 2: Upload file directly to R2
      await UploadService.uploadFileToR2(uploadUrl, file, (percent) => {
        setProgress(percent);
      });

      const uploadResult = { uploadUrl, publicUrl, r2Key };
      setResult(uploadResult);
      return uploadResult;
    } catch (err: any) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const resetUploadState = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    uploadFile,
    uploading,
    progress,
    error,
    result,
    resetUploadState,
  };
};
