import React, { useState } from 'react';
import { Check, Minus, Info } from 'lucide-react';
import { USER_ROLES, type UserRole } from '@shared/constants/roles';
import {
  SYSTEM_PERMISSIONS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  ROLE_DEFAULT_PERMISSIONS,
} from '@shared/constants/permissions';

const ROLES_TO_DISPLAY: { role: UserRole; title: string; badgeClass: string }[] = [
  { role: USER_ROLES.SUPPORT_AGENT, title: 'Support Agent', badgeClass: 'bg-slate-100 text-slate-700' },
  { role: USER_ROLES.MANAGER, title: 'Store Manager', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  { role: USER_ROLES.ADMIN, title: 'Administrator', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200' },
  { role: USER_ROLES.SUPER_ADMIN, title: 'Super Admin', badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200' },
];

export const PermissionsMatrixPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const filteredModules =
    selectedModule === 'all'
      ? PERMISSION_MODULES
      : PERMISSION_MODULES.filter((m) => m === selectedModule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Granular Permissions Matrix</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive comparison of administrative capabilities granted across each organizational role.
        </p>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200/90 rounded-lg text-xs">
        <button
          type="button"
          onClick={() => setSelectedModule('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
            selectedModule === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Domains ({SYSTEM_PERMISSIONS.length})
        </button>
        {PERMISSION_MODULES.map((mod) => {
          const count = SYSTEM_PERMISSIONS.filter((p) => p.module === mod).length;
          const isSelected = selectedModule === mod;
          return (
            <button
              key={mod}
              type="button"
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {PERMISSION_MODULE_LABELS[mod]} ({count})
            </button>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-1/3">Permission & Scope</th>
                {ROLES_TO_DISPLAY.map((r) => (
                  <th key={r.role} className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${r.badgeClass}`}>
                      {r.title}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((mod) => {
                const perms = SYSTEM_PERMISSIONS.filter((p) => p.module === mod);

                return (
                  <React.Fragment key={mod}>
                    {/* Domain Category Header Row */}
                    <tr className="bg-slate-50/70 border-y border-slate-200/60">
                      <td colSpan={5} className="py-2 px-4 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                        {PERMISSION_MODULE_LABELS[mod]}
                      </td>
                    </tr>

                    {/* Permissions in Domain */}
                    {perms.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{p.label}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                {p.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{p.description}</p>
                          </div>
                        </td>

                        {/* Roles Checkmarks */}
                        {ROLES_TO_DISPLAY.map((r) => {
                          const hasPermission = (ROLE_DEFAULT_PERMISSIONS[r.role] || []).includes(p.id);

                          return (
                            <td key={r.role} className="py-3 px-4 text-center">
                              {hasPermission ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                                  <Minus className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Notice Card */}
      <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Individual Permission Overrides</p>
          <p className="text-indigo-800/90 text-[11px] leading-relaxed">
            The table above represents the standard baseline for each organizational role. When inviting team members or editing active staff in the User Directory, Super Administrators can toggle custom overrides to grant specific additional privileges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionsMatrixPage;
