import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model } from 'mongoose';
import { RequestMeta } from '../../common/decorators/request-meta.decorator';
import { Paginated, skipFor, toPaginated } from '../../common/utils/pagination.util';
import { AuditEvent } from './audit-event.enum';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

import { User, UserDocument } from '../users/schemas/user.schema';
import { parseUserAgent } from './utils/user-agent.parser';
import { LoginActivityQueryDto } from './dto/login-activity-query.dto';

export interface AuditSubject {
  _id?: string;
  email?: string;
  role?: string;
}

export interface AuditEntry {
  event: AuditEvent;
  subject?: AuditSubject | null;
  userId?: string;
  email?: string;
  role?: string;
  actorId?: string;
  actorEmail?: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  portal?: string;
  ip?: string;
  userAgent?: string;
  meta?: RequestMeta;
  metadata?: Record<string, unknown>;
}

export interface LoginActivityItem {
  id: string;
  userId?: string;
  userName: string;
  email: string;
  userCode?: string;
  designation?: string;
  role: string;
  event: AuditEvent;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOGOUT';
  statusLabel: string;
  failureReason?: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  userAgent?: string;
  createdAt: Date;
}

export interface LoginActivityStats {
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  uniqueStaffCount: number;
}

export interface LoginActivityResponse {
  items: LoginActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: LoginActivityStats;
}

const LOGIN_EVENTS = [
  AuditEvent.LOGIN_SUCCESS,
  AuditEvent.LOGIN_FAILED,
  AuditEvent.LOGIN_BLOCKED_LOCKED,
  AuditEvent.ACCOUNT_LOCKED,
  AuditEvent.MFA_CHALLENGE_FAILED,
  AuditEvent.LOGOUT,
  AuditEvent.LOGOUT_ALL,
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLogDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Record an event. Never throws: auditing must not break the audited action. */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.auditModel.create({
        event: entry.event,
        userId: entry.userId ?? entry.subject?._id,
        email: entry.email ?? entry.subject?.email,
        role: entry.role ?? entry.subject?.role,
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        resourceName: entry.resourceName,
        portal: entry.portal,
        ip: entry.ip ?? entry.meta?.ip,
        userAgent: entry.userAgent ?? entry.meta?.userAgent,
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

  async getLoginActivity(query: LoginActivityQueryDto): Promise<LoginActivityResponse> {
    const filter: Record<string, any> = {
      event: { $in: LOGIN_EVENTS },
      $or: [{ portal: 'admin' }, { role: { $in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT_AGENT'] } }],
    };

    if (query.status && query.status !== 'all') {
      if (query.status === 'SUCCESS') filter.event = AuditEvent.LOGIN_SUCCESS;
      else if (query.status === 'FAILED') filter.event = { $in: [AuditEvent.LOGIN_FAILED, AuditEvent.MFA_CHALLENGE_FAILED] };
      else if (query.status === 'BLOCKED') filter.event = { $in: [AuditEvent.LOGIN_BLOCKED_LOCKED, AuditEvent.ACCOUNT_LOCKED] };
      else if (query.status === 'LOGOUT') filter.event = { $in: [AuditEvent.LOGOUT, AuditEvent.LOGOUT_ALL] };
    }

    if (query.userId) filter.userId = query.userId;

    if (query.range && query.range !== 'all') {
      const now = new Date();
      if (query.range === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filter.createdAt = { $gte: start };
      } else if (query.range === '7d') {
        filter.createdAt = { $gte: new Date(Date.now() - 7 * 86400000) };
      } else if (query.range === '30d') {
        filter.createdAt = { $gte: new Date(Date.now() - 30 * 86400000) };
      }
    }

    if (query.q && query.q.trim()) {
      const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$and = [
        {
          $or: [
            { email: { $regex: escaped, $options: 'i' } },
            { ip: { $regex: escaped, $options: 'i' } },
            { userAgent: { $regex: escaped, $options: 'i' } },
          ],
        },
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.auditModel.countDocuments(filter),
    ]);

    // Unique user ids/emails to look up profile info
    const emails = Array.from(new Set(logs.map((l) => l.email).filter(Boolean)));
    const userDocs = await this.userModel.find({ email: { $in: emails } }).lean();
    const userMap = new Map<string, any>(userDocs.map((u) => [u.email.toLowerCase(), u]));

    const items: LoginActivityItem[] = logs.map((log) => {
      const user = log.email ? userMap.get(log.email.toLowerCase()) : null;
      const client = parseUserAgent(log.userAgent);

      let status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOGOUT' = 'SUCCESS';
      let statusLabel = 'Sign-in Successful';
      let failureReason: string | undefined = undefined;

      if (log.event === AuditEvent.LOGIN_SUCCESS) {
        status = 'SUCCESS';
        statusLabel = 'Sign-in Successful';
      } else if (log.event === AuditEvent.LOGIN_FAILED) {
        status = 'FAILED';
        statusLabel = 'Failed Sign-in';
        failureReason = (log.metadata?.reason as string) || 'Invalid credentials';
      } else if (log.event === AuditEvent.MFA_CHALLENGE_FAILED) {
        status = 'FAILED';
        statusLabel = 'MFA Verification Failed';
        failureReason = 'Invalid 2FA authentication code';
      } else if (log.event === AuditEvent.LOGIN_BLOCKED_LOCKED || log.event === AuditEvent.ACCOUNT_LOCKED) {
        status = 'BLOCKED';
        statusLabel = 'Sign-in Blocked';
        failureReason = 'Account temporarily locked due to excessive failed attempts';
      } else if (log.event === AuditEvent.LOGOUT || log.event === AuditEvent.LOGOUT_ALL) {
        status = 'LOGOUT';
        statusLabel = log.event === AuditEvent.LOGOUT_ALL ? 'All Sessions Terminated' : 'Signed Out';
      }

      return {
        id: (log as any)._id.toString(),
        userId: user ? user._id.toString() : log.userId,
        userName: user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : log.email || 'Administrator'),
        email: log.email || user?.email || 'unknown',
        userCode: user?.userCode,
        designation: user?.designation,
        role: user?.role || log.role || 'ADMIN',
        event: log.event,
        status,
        statusLabel,
        failureReason,
        ip: log.ip || '127.0.0.1',
        browser: client.browser,
        os: client.os,
        device: client.device,
        userAgent: log.userAgent,
        createdAt: (log as any).createdAt,
      };
    });

    // Compute stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayTotal, todaySuccess, todayFailed, todayUniqueUsers] = await Promise.all([
      this.auditModel.countDocuments({
        event: { $in: LOGIN_EVENTS },
        portal: 'admin',
        createdAt: { $gte: todayStart },
      }),
      this.auditModel.countDocuments({
        event: AuditEvent.LOGIN_SUCCESS,
        portal: 'admin',
        createdAt: { $gte: todayStart },
      }),
      this.auditModel.countDocuments({
        event: { $in: [AuditEvent.LOGIN_FAILED, AuditEvent.LOGIN_BLOCKED_LOCKED, AuditEvent.MFA_CHALLENGE_FAILED] },
        portal: 'admin',
        createdAt: { $gte: todayStart },
      }),
      this.auditModel.distinct('email', {
        event: AuditEvent.LOGIN_SUCCESS,
        portal: 'admin',
        createdAt: { $gte: todayStart },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalAttempts: todayTotal,
        successCount: todaySuccess,
        failedCount: todayFailed,
        uniqueStaffCount: todayUniqueUsers.length,
      },
    };
  }
}
