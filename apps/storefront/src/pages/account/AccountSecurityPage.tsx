import AccountSecuritySections from '@shared/auth/components/AccountSecuritySections';

/** Storefront: /account/security (rendered inside CustomerLayout by the router). */
export default function AccountSecurityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Account security</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your password, two-factor authentication and signed-in devices.</p>
      </div>
      <AccountSecuritySections />
    </div>
  );
}
