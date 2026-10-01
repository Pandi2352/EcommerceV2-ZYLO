import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import { AccountType } from '../../common/enums/account-type.enum';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { InvitationStatus, StaffInvitation, StaffInvitationDocument } from '../invitations/schemas/staff-invitation.schema';
import { SignInStatsService } from './sign-in-stats.service';
import { UserManagementOverview } from './user-overview.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const EXPIRING_WINDOW_MS = 2 * DAY_MS;
const PRIVILEGED_ROLE_KEYS = ['super_admin', 'admin'];
const ATTENTION_LIMIT = 5;

/** Read-only aggregate for the User management → Overview page. */
@Injectable()
export class UserOverviewService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(StaffInvitation.name) private readonly invitationModel: Model<StaffInvitationDocument>,
    private readonly signInStats: SignInStatsService,
  ) {}

  async getOverview(days: number): Promise<UserManagementOverview> {
    const now = new Date();
    const since = new Date(now.getTime() - (days - 1) * DAY_MS);
    since.setUTCHours(0, 0, 0, 0);
    const staff: QueryFilter<User> = { accountType: AccountType.STAFF, deletedAt: { $exists: false } };
    const active = { ...staff, status: UserStatus.ACTIVE };

    const [total, activeCount, locked, mfaEnabled, neverSignedIn, idle, roles, roleCounts, inviteCounts, expiringSoon, sentInPeriod, lockedUsers, expiringInvites, signIns, recentChanges] =
      await Promise.all([
        this.userModel.countDocuments(staff),
        this.userModel.countDocuments(active),
        this.userModel.countDocuments({ ...staff, lockUntil: { $gt: now } }),
        this.userModel.countDocuments({ ...staff, mfaEnabled: true }),
        this.userModel.countDocuments({ ...staff, lastLoginAt: { $exists: false } }),
        this.userModel.countDocuments({ ...active, lastLoginAt: { $lt: since } }),
        this.roleModel.find().select('name key status').lean(),
        this.userModel.aggregate<{ _id: string; count: number }>([
          { $match: staff },
          { $unwind: '$roleIds' },
          { $group: { _id: '$roleIds', count: { $sum: 1 } } },
        ]),
        this.invitationModel.aggregate<{ _id: InvitationStatus; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        this.invitationModel.countDocuments({ status: InvitationStatus.INVITED, expiresAt: { $gt: now, $lt: new Date(now.getTime() + EXPIRING_WINDOW_MS) } }),
        this.invitationModel.countDocuments({ createdAt: { $gte: since } }),
        this.userModel.find({ ...staff, lockUntil: { $gt: now } }).select('name email lockUntil').limit(ATTENTION_LIMIT).lean(),
        this.invitationModel
          .find({ status: InvitationStatus.INVITED, expiresAt: { $gt: now, $lt: new Date(now.getTime() + EXPIRING_WINDOW_MS) } })
          .select('firstName lastName email expiresAt')
          .sort({ expiresAt: 1 })
          .limit(ATTENTION_LIMIT)
          .lean(),
        this.signInStats.signIns(since, days),
        this.signInStats.recentChanges(),
      ]);

    const countByRole = new Map(roleCounts.map((r) => [String(r._id), r.count]));
    const countByStatus = new Map(inviteCounts.map((r) => [r._id, r.count]));
    // Invitations still marked INVITED but past expiry count as expired
    const lapsed = await this.invitationModel.countDocuments({ status: InvitationStatus.INVITED, expiresAt: { $lte: now } });

    const privilegedIds = roles.filter((r) => PRIVILEGED_ROLE_KEYS.includes(r.key)).map((r) => String(r._id));
    const privilegedWithout2fa = await this.userModel
      .find({ ...active, mfaEnabled: { $ne: true }, roleIds: { $in: privilegedIds } })
      .select('name email roleIds')
      .limit(ATTENTION_LIMIT)
      .lean();
    const roleName = new Map(roles.map((r) => [String(r._id), r.name]));

    return {
      generatedAt: now.toISOString(),
      days,
      users: { total, active: activeCount, inactive: total - activeCount, locked, mfaEnabled, neverSignedIn, idle },
      roles: {
        total: roles.length,
        active: roles.filter((r) => r.status === 'ACTIVE').length,
        inactive: roles.filter((r) => r.status !== 'ACTIVE').length,
        distribution: roles
          .map((r) => ({ id: String(r._id), name: r.name, status: r.status, userCount: countByRole.get(String(r._id)) ?? 0 }))
          .sort((a, b) => b.userCount - a.userCount || a.name.localeCompare(b.name)),
      },
      invitations: {
        invited: (countByStatus.get(InvitationStatus.INVITED) ?? 0) - lapsed,
        registered: countByStatus.get(InvitationStatus.REGISTERED) ?? 0,
        expired: (countByStatus.get(InvitationStatus.EXPIRED) ?? 0) + lapsed,
        revoked: countByStatus.get(InvitationStatus.REVOKED) ?? 0,
        expiringSoon,
        sentInPeriod,
      },
      signIns,
      attention: {
        locked: lockedUsers.map((u) => ({ id: String(u._id), name: u.name, email: u.email, lockUntil: new Date(u.lockUntil as Date).toISOString() })),
        privilegedWithout2fa: privilegedWithout2fa.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          roleName: (u.roleIds ?? []).map((id) => roleName.get(String(id))).find(Boolean) ?? '—',
        })),
        expiringInvitations: expiringInvites.map((i) => ({
          id: String(i._id),
          name: `${i.firstName} ${i.lastName}`.trim(),
          email: i.email,
          expiresAt: new Date(i.expiresAt).toISOString(),
        })),
      },
      recentChanges,
    };
  }
}
