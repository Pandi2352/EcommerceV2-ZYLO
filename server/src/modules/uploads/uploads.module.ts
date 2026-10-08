import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { LocalStorageService } from './storage/local-storage.service';
import { STORAGE_SERVICE_TOKEN } from './storage/storage.interface';

@Module({
  controllers: [UploadsController],
  providers: [
    LocalStorageService,
    {
      provide: STORAGE_SERVICE_TOKEN,
      useExisting: LocalStorageService,
    },
    UploadsService,
  ],
  exports: [UploadsService, STORAGE_SERVICE_TOKEN],
})
export class UploadsModule {}
