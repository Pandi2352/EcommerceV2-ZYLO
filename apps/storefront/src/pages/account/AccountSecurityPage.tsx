import AccountSecuritySections from '@shared/auth/components/AccountSecuritySections';
import AccountLayout from '../../features/account/components/AccountLayout';

/** Storefront: /account/security (rendered inside CustomerLayout by the router). */
export default function AccountSecurityPage() {
  return (
    <AccountLayout>
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Account Security</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage your password, two-factor authentication, and signed-in devices.
          </p>
        </div>
        <AccountSecuritySections />
      </div>
    </AccountLayout>
  );
}
