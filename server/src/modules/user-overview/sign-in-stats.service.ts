import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../audit/schemas/audit-log.schema';
import { AuditEvent } from '../audit/audit-event.enum';
import { SignInDay, UserManagementOverview } from './user-overview.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const FAILED = [AuditEvent.LOGIN_FAILED, AuditEvent.MFA_CHALLENGE_FAILED];
const BLOCKED = [AuditEvent.LOGIN_BLOCKED_LOCKED, AuditEvent.ACCOUNT_LOCKED];

const USER_MANAGEMENT_EVENTS = [
  AuditEvent.USER_CREATED, AuditEvent.USER_UPDATED, AuditEvent.USER_ROLE_CHANGED,
  AuditEvent.USER_ACTIVATED, AuditEvent.USER_DEACTIVATED, AuditEvent.USER_DELETED,
  AuditEvent.ROLE_CREATED, AuditEvent.ROLE_UPDATED, AuditEvent.ROLE_DELETED, AuditEvent.ROLE_PERMISSIONS_UPDATED,
  AuditEvent.INVITATION_SENT, AuditEvent.INVITATION_RESENT, AuditEvent.INVITATION_REVOKED, AuditEvent.INVITATION_ACCEPTED,
];

/** Admin-portal sign-in figures and recent user-management changes from the audit log. */
@Injectable()
export class SignInStatsService {
  constructor(@InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLogDocument>) {}

  async signIns(since: Date, days: number): Promise<UserManagementOverview['signIns']> {
    const rows = await this.auditModel.aggregate<{ _id: { day: string; event: string }; count: number }>([
      { $match: { portal: 'admin', createdAt: { $gte: since }, event: { $in: [AuditEvent.LOGIN_SUCCESS, ...FAILED, ...BLOCKED] } } },
      { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, event: '$event' }, count: { $sum: 1 } } },
    ]);

    // One entry per day, including days with no activity
    const byDay = new Map<string, SignInDay>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
      byDay.set(date, { date, success: 0, failed: 0 });
    }

    let blocked = 0;
    for (const { _id, count } of rows) {
      const day = byDay.get(_id.day);
      if (BLOCKED.includes(_id.event as AuditEvent)) blocked += count;
      else if (day && _id.event === AuditEvent.LOGIN_SUCCESS) day.success += count;
      else if (day) day.failed += count;
    }

    const series = [...byDay.values()];
    return {
      series,
      success: series.reduce((sum, d) => sum + d.success, 0),
      failed: series.reduce((sum, d) => sum + d.failed, 0),
      blocked,
    };
  }

  async recentChanges(limit = 8): Promise<UserManagementOverview['recentChanges']> {
    const logs = await this.auditModel
      .find({ event: { $in: USER_MANAGEMENT_EVENTS } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return logs.map((log) => ({
      id: String(log._id),
      event: log.event,
      actorEmail: log.actorEmail,
      target: log.resourceName ?? log.email,
      createdAt: new Date(log.createdAt as Date).toISOString(),
    }));
  }
}
