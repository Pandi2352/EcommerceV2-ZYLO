import { api, unwrap } from './client';
import type { UploadedFile, UploadFolder } from '../types/upload';

export const uploadsService = {
  /**
   * Upload a single image file (JPEG, PNG, WebP, GIF, SVG - Max 5MB)
   */
  uploadSingle: async (file: File, folder: UploadFolder = 'general'): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);

    return unwrap<UploadedFile>(
      api.post('/uploads/image', formData, {
        params: { folder },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
  },

  /**
   * Upload up to 10 image files simultaneously
   */
  uploadMultiple: async (files: File[], folder: UploadFolder = 'general'): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    return unwrap<UploadedFile[]>(
      api.post('/uploads/multiple', formData, {
        params: { folder },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );
  },

  /**
   * Delete an uploaded image file by path or key
   */
  deleteFile: async (fileKey: string): Promise<{ success: boolean; message: string }> => {
    return unwrap<{ success: boolean; message: string }>(
      api.delete('/uploads', {
        data: { fileKey },
      }),
    );
  },
};
