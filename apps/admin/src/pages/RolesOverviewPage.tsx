import React, { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, UserCheck, ArrowRight, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES, type UserRole } from '@shared/constants/roles';
import { ROLE_DEFAULT_PERMISSIONS, SYSTEM_PERMISSIONS } from '@shared/constants/permissions';
import Button from '@shared/ui/Button';
import { ROUTES } from '../routes/routePaths';
import { staffService, type StaffStats } from '../services/staff.service';

interface RoleCardMeta {
  role: UserRole;
  title: string;
  badgeColor: string;
  cardBorder: string;
  iconBg: string;
  icon: React.ReactNode;
  level: string;
  description: string;
  keyResponsibilities: string[];
}

const ROLES_METADATA: RoleCardMeta[] = [
  {
    role: USER_ROLES.SUPER_ADMIN,
    title: 'Super Administrator',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    cardBorder: 'hover:border-purple-300',
    iconBg: 'bg-purple-50 text-purple-700',
    icon: <ShieldAlert className="w-5 h-5" />,
    level: 'Level 4 — Root Authority',
    description:
      'Unrestricted ownership across all administrative features, security policies, billing, and staff lifecycle.',
    keyResponsibilities: [
      'Manage staff roles and assign Super Administrator privileges',
      'Configure payment gateways, taxes, and shipping integrations',
      'Access immutable security audit trails and platform logs',
      'Full catalog, orders, promotions, and customer management',
    ],
  },
  {
    role: USER_ROLES.ADMIN,
    title: 'Administrator',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    cardBorder: 'hover:border-blue-300',
    iconBg: 'bg-blue-50 text-blue-700',
    icon: <ShieldCheck className="w-5 h-5" />,
    level: 'Level 3 — Operations Authority',
    description:
      'Supervises business operations, team invitations, product management, and full customer dispute resolution.',
    keyResponsibilities: [
      'Invite new staff members and manage granular operational permissions',
      'Manage product catalog, brand partnerships, and inventory thresholds',
      'Process customer returns, refunds, and order cancellations',
      'Inspect security logs and platform audit history',
    ],
  },
  {
    role: USER_ROLES.MANAGER,
    title: 'Store Manager',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cardBorder: 'hover:border-emerald-300',
    iconBg: 'bg-emerald-50 text-emerald-700',
    icon: <UserCheck className="w-5 h-5" />,
    level: 'Level 2 — Merchandising & Sales',
    description:
      'Focuses on inventory levels, product updates, order processing, and publishing marketing promotions.',
    keyResponsibilities: [
      'Create and update product listings, stock counts, and categories',
      'Manage orders, shipment dispatches, and delivery status updates',
      'Publish discount coupons, vouchers, and flash promotions',
      'View customer profiles and manage product ratings',
    ],
  },
  {
    role: USER_ROLES.SUPPORT_AGENT,
    title: 'Support Agent',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    cardBorder: 'hover:border-slate-300',
    iconBg: 'bg-slate-50 text-slate-700',
    icon: <Shield className="w-5 h-5" />,
    level: 'Level 1 — Customer Care',
    description:
      'Assists customers with order tracking, reviews inquiries, and provides first-line issue resolution.',
    keyResponsibilities: [
      'Inspect customer order statuses, addresses, and line-item details',
      'View catalog availability and stock levels',
      'Browse customer contact details and order histories',
      'Read-only access to store data with no deletion rights',
    ],
  },
];

export const RolesOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StaffStats | null>(null);

  useEffect(() => {
    staffService
      .listStaff({ limit: 1 })
      .then((res) => {
        if (res?.stats) {
          setStats(res.stats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Roles & Access Hierarchy</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role definitions, permission inheritance rules, and active team member distribution.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.USERS_PERMISSIONS)}
            leftIcon={<Key className="w-3.5 h-3.5" />}
            className="py-2 text-xs"
          >
            Permissions Matrix
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.USERS)}
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            className="py-2 text-xs"
          >
            View Staff Directory
          </Button>
        </div>
      </div>

      {/* Role Hierarchy Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ROLES_METADATA.map((r) => {
          const userCount = stats?.rolesDistribution?.[r.role] ?? 0;
          const defaultPerms = ROLE_DEFAULT_PERMISSIONS[r.role] || [];

          return (
            <div
              key={r.role}
              className={`bg-white border border-slate-200/90 rounded-lg p-5 flex flex-col justify-between transition-all duration-150 ${r.cardBorder}`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${r.iconBg} flex items-center justify-center`}>
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{r.title}</h3>
                      <p className="text-[11px] font-semibold text-slate-400">{r.level}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${r.badgeColor}`}>
                    {userCount} {userCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4">{r.description}</p>

                {/* Key Responsibilities */}
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Core Capabilities
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {r.keyResponsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">{defaultPerms.length}</span> of{' '}
                  {SYSTEM_PERMISSIONS.length} system permissions
                </span>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.USERS)}
                  className="inline-flex items-center gap-1 font-semibold text-[#299cdb] hover:text-[#2181b5] cursor-pointer"
                >
                  <span>View members</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RolesOverviewPage;
