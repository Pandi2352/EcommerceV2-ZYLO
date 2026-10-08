import 'multer';

export interface UploadedFileResult {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  folder: string;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
  deleteFile(fileKeyOrPath: string): Promise<boolean>;
}

export const STORAGE_SERVICE_TOKEN = 'STORAGE_SERVICE_TOKEN';
