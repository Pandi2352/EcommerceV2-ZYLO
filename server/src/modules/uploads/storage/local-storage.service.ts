import 'multer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, UploadedFileResult } from './storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadsDir: string;
  private readonly serverBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.uploadsDir = path.resolve(process.cwd(), 'uploads');
    const port = this.config.get<string>('PORT', '5000');
    this.serverBaseUrl = (this.config.get<string>('SERVER_URL') || `http://localhost:${port}`).replace(/\/+$/, '');

    // Ensure uploads directory exists on bootstrap
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder = 'general'): Promise<UploadedFileResult> {
    // Sanitize folder name (alphanumeric and hyphens only)
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'general';
    const targetFolderDir = path.join(this.uploadsDir, safeFolder);

    await fs.promises.mkdir(targetFolderDir, { recursive: true });

    // Sanitize original filename and extract extension
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 50);

    const uniqueFilename = `${Date.now()}-${uuidv4().slice(0, 8)}-${baseName}${ext}`;
    const destinationPath = path.join(targetFolderDir, uniqueFilename);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const relativePath = `/uploads/${safeFolder}/${uniqueFilename}`;
    const publicUrl = `${this.serverBaseUrl}${relativePath}`;

    this.logger.log(`Uploaded file stored: ${relativePath} (${file.size} bytes)`);

    return {
      url: publicUrl,
      path: relativePath,
      filename: uniqueFilename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      folder: safeFolder,
    };
  }

  async deleteFile(fileKeyOrPath: string): Promise<boolean> {
    if (!fileKeyOrPath) return false;

    try {
      // Strip serverBaseUrl if full URL is passed
      let cleanPath = fileKeyOrPath;
      if (cleanPath.startsWith(this.serverBaseUrl)) {
        cleanPath = cleanPath.slice(this.serverBaseUrl.length);
      }

      // Remove query parameters or hash if any
      cleanPath = cleanPath.split('?')[0].split('#')[0];

      // Remove leading '/uploads/' or 'uploads/'
      cleanPath = cleanPath.replace(/^\/?uploads\//, '');

      // Resolve and verify file is strictly inside uploadsDir
      const fullPath = path.resolve(this.uploadsDir, cleanPath);
      if (!fullPath.startsWith(this.uploadsDir)) {
        this.logger.warn(`Security violation attempt: Path traversal blocked for ${fileKeyOrPath}`);
        return false;
      }

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.log(`Deleted file: ${cleanPath}`);
        return true;
      }
      return false;
    } catch (err: any) {
      this.logger.error(`Error deleting file ${fileKeyOrPath}: ${err.message}`);
      return false;
    }
  }
}
