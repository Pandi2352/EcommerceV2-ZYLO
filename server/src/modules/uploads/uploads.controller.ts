import 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StaffOnly } from '../../common/authorization/account-type.decorator';
import { UploadsService } from './uploads.service';
import { UploadQueryDto } from './dto/upload-query.dto';
import { DeleteFileDto } from './dto/delete-file.dto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function imageFileFilter(
  _req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types are: JPEG, PNG, WebP, GIF, SVG.`,
      ),
      false,
    );
  }
  callback(null, true);
}

@ApiTags('Uploads & Media Management')
@ApiBearerAuth('JWT-auth')
@ApiCookieAuth('access_token')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Upload a single image file (Max 5MB: JPEG, PNG, WebP, GIF, SVG)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully with URL and relative path' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeds 5MB' })
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query() query: UploadQueryDto,
  ) {
    return this.uploadsService.uploadSingle(file, query.folder || 'general');
  }

  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: imageFileFilter,
    }),
  )
  @ApiOperation({ summary: 'Upload up to 10 images at once (Max 5MB each)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of image files to upload',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() query: UploadQueryDto,
  ) {
    return this.uploadsService.uploadMultiple(files, query.folder || 'general');
  }

  @StaffOnly()
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Delete an uploaded file by path or URL' })
  @ApiResponse({ status: 200, description: 'File deleted result' })
  async deleteFile(@Body() dto: DeleteFileDto) {
    return this.uploadsService.deleteFile(dto.fileKey);
  }
}
