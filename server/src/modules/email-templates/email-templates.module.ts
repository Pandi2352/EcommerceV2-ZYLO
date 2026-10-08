import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplate, EmailTemplateSchema } from './schemas/email-template.schema';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplatesController } from './email-templates.controller';
import { EmailTemplatesSeedService } from './email-templates-seed.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
    ]),
    MailModule,
  ],
  controllers: [EmailTemplatesController],
  providers: [EmailTemplatesService, EmailTemplatesSeedService],
  exports: [EmailTemplatesService],
})
export class EmailTemplatesModule {}
