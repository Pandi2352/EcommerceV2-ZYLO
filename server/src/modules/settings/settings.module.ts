import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schemas/setting.schema';
import { ContactInquiry, ContactInquirySchema } from './schemas/contact-inquiry.schema';
import { SettingsService } from './settings.service';
import { PublicSettingsController, AdminSettingsController } from './settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setting.name, schema: SettingSchema },
      { name: ContactInquiry.name, schema: ContactInquirySchema },
    ]),
  ],
  controllers: [PublicSettingsController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
