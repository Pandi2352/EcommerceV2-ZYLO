import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { ContactInquiry, ContactInquiryDocument } from './schemas/contact-inquiry.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
    @InjectModel(ContactInquiry.name) private readonly inquiryModel: Model<ContactInquiryDocument>,
  ) {}

  /**
   * Retrieves the singleton store business settings (creates default if missing)
   */
  async getSettings(): Promise<SettingDocument> {
    let settings = await this.settingModel.findOne();
    if (!settings) {
      settings = await this.settingModel.create({
        storeName: 'ZYLO Commerce',
        tagline: 'Mega Store & Supermarket',
        companyLegalName: 'Zylo Global Retail Inc.',
        announcementBarText: 'Free shipping for all orders over $50.00',
        currencyCode: 'USD',
        currencySymbol: '$',
        currencyPlacement: 'prefix',
        decimalPlaces: 2,
        taxRate: 8,
        freeShippingThreshold: 50,
        defaultShippingFee: 10,
        expressShippingFee: 25,
        supportEmail: 'support@zylo.com',
        salesEmail: 'sales@zylo.com',
        phone: '+1 800 900 2956',
        whatsapp: '+1 800 900 2956',
        address: '5171 W Campbell Ave, San Jose, CA 95124, United States',
        city: 'San Jose',
        state: 'CA',
        postalCode: '95124',
        country: 'United States',
        operatingHours: 'Mon - Fri: 9:00 AM - 8:00 PM EST',
        googleMapsUrl: '',
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com',
        youtube: 'https://youtube.com',
        orderNumberPrefix: 'ZYLO-',
        enableCod: true,
        enableMaintenanceMode: false,
      });
      this.logger.log('Initialized default singleton store business settings');
    }
    return settings;
  }

  /**
   * Public settings exposed to customer storefront without administrative secrets
   */
  async getPublicSettings() {
    const s = await this.getSettings();
    return {
      storeName: s.storeName,
      tagline: s.tagline,
      companyLegalName: s.companyLegalName,
      announcementBarText: s.announcementBarText,
      currencyCode: s.currencyCode,
      currencySymbol: s.currencySymbol,
      currencyPlacement: s.currencyPlacement,
      decimalPlaces: s.decimalPlaces,
      taxRate: s.taxRate,
      freeShippingThreshold: s.freeShippingThreshold,
      defaultShippingFee: s.defaultShippingFee,
      expressShippingFee: s.expressShippingFee,
      supportEmail: s.supportEmail,
      salesEmail: s.salesEmail,
      phone: s.phone,
      whatsapp: s.whatsapp,
      address: s.address,
      city: s.city,
      state: s.state,
      postalCode: s.postalCode,
      country: s.country,
      operatingHours: s.operatingHours,
      googleMapsUrl: s.googleMapsUrl,
      facebook: s.facebook,
      twitter: s.twitter,
      instagram: s.instagram,
      linkedin: s.linkedin,
      youtube: s.youtube,
      enableCod: s.enableCod,
      enableMaintenanceMode: s.enableMaintenanceMode,
      defaultOnlineProvider: s.defaultOnlineProvider || 'stripe',
      paymentProviders: {
        stripe: {
          enabled: s.stripeEnabled ?? true,
          mode: s.stripeMode || 'test',
          publishableKey: s.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || '',
        },
        razorpay: {
          enabled: s.razorpayEnabled ?? false,
          mode: s.razorpayMode || 'test',
          keyId: s.razorpayKeyId || '',
        },
        paypal: {
          enabled: s.paypalEnabled ?? false,
          mode: s.paypalMode || 'sandbox',
          clientId: s.paypalClientId || '',
        },
      },
    };
  }

  /**
   * Admin: Update business settings
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<SettingDocument> {
    let settings = await this.settingModel.findOne();
    if (!settings) {
      settings = new this.settingModel(dto);
    } else {
      Object.assign(settings, dto);
    }
    await settings.save();
    this.logger.log(`Updated business settings: currencyCode=${settings.currencyCode}, symbol=${settings.currencySymbol}`);
    return settings;
  }

  /**
   * Customer: Submit contact form message
   */
  async submitContactInquiry(dto: CreateContactInquiryDto): Promise<ContactInquiryDocument> {
    const inquiry = await this.inquiryModel.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() || '',
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      status: 'NEW',
    });
    this.logger.log(`Received new contact inquiry from ${inquiry.email}: "${inquiry.subject}"`);
    return inquiry;
  }

  /**
   * Admin: Retrieve recent customer contact inquiries
   */
  async getContactInquiriesAdmin(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
      this.inquiryModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.inquiryModel.countDocuments(),
    ]);

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Update contact inquiry status
   */
  async updateInquiryStatus(id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED') {
    const inquiry = await this.inquiryModel.findById(id);
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    inquiry.status = status;
    await inquiry.save();
    return inquiry;
  }
}
