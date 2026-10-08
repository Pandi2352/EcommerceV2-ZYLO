export interface UploadedFile {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  folder: string;
}

export type UploadFolder = 'products' | 'categories' | 'brands' | 'avatars' | 'general';
