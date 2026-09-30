import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model } from 'mongoose';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { Paginated, skipFor, toPaginated } from '../../common/utils/pagination.util';
import { AuditEvent } from './audit-event.enum';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

export interface AuditSubject {
  _id?: string;
  email?: string;
  role?: string;
}

export interface AuditEntry {
  event: AuditEvent;
  subject?: AuditSubject | null;
  email?: string;
  portal?: string;
  meta?: RequestMeta;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLogDocument>) {}

  /** Record an event. Never throws: auditing must not break the audited action. */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.auditModel.create({
        event: entry.event,
        userId: entry.subject?._id,
        email: entry.subject?.email ?? entry.email,
        role: entry.subject?.role,
        portal: entry.portal,
        ip: entry.meta?.ip,
        userAgent: entry.meta?.userAgent,
        metadata: entry.metadata,
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log (${entry.event}): ${(error as Error).message}`);
    }
  }

  async list(query: AuditLogQueryDto): Promise<Paginated<AuditLogDocument>> {
    const filter: QueryFilter<AuditLog> = {};
    if (query.event) filter.event = query.event;
    if (query.email) filter.email = query.email.toLowerCase();
    if (query.userId) filter.userId = query.userId;
    if (query.portal) filter.portal = query.portal;

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skipFor(query.page, query.limit))
        .limit(query.limit)
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);
    return toPaginated(items, total, query.page, query.limit);
  }
}
