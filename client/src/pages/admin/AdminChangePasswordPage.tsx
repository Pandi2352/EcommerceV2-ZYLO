import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useAuth } from '../../context/AuthContext';
import AuthCard from '../../features/auth/components/AuthCard';
import ChangePasswordForm from '../../features/auth/components/ChangePasswordForm';
import Alert from '../../components/feedback/Alert';

/** Forced password change for staff accounts flagged `mustChangePassword` (e.g. first sign-in). */
export default function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    navigate(ROUTES.ADMIN.LOGIN, { replace: true });
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle={`Signed in as ${user?.email ?? ''}`}
      footer={
        <button
          type="button"
          onClick={signOut}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out instead
        </button>
      }
    >
      {user?.mustChangePassword && (
        <Alert tone="warning" className="mb-5">
          Your account uses a temporary password. Choose a new one to continue.
        </Alert>
      )}
      <ChangePasswordForm
        submitLabel="Save and continue"
        onChanged={() => navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })}
      />
    </AuthCard>
  );
}
