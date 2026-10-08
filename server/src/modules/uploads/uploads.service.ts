import 'multer';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IStorageService, STORAGE_SERVICE_TOKEN, UploadedFileResult } from './storage/storage.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async uploadSingle(file?: Express.Multer.File, folder = 'general'): Promise<UploadedFileResult> {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }
    return this.storageService.uploadFile(file, folder);
  }

  async uploadMultiple(files?: Express.Multer.File[], folder = 'general'): Promise<UploadedFileResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided for upload');
    }

    const uploadPromises = files.map((file) => this.storageService.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileKey: string): Promise<{ success: boolean; message: string }> {
    if (!fileKey) {
      throw new BadRequestException('File key is required');
    }
    const success = await this.storageService.deleteFile(fileKey);
    return {
      success,
      message: success ? 'File deleted successfully' : 'File not found or already deleted',
    };
  }
}
