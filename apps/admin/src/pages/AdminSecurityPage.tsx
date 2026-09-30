import AccountSecuritySections from '@shared/auth/components/AccountSecuritySections';

/** Admin: /admin/settings, the signed-in staff member's own security settings. */
export default function AdminSecurityPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account security</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Staff accounts should keep two-factor authentication turned on.
        </p>
      </div>
      <AccountSecuritySections />
    </div>
  );
}
