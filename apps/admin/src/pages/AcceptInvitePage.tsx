import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { ROLE_LABELS } from '@shared/constants/roles';
import InputField from '@shared/ui/InputField';
import PasswordField from '@shared/ui/PasswordField';
import Button from '@shared/ui/Button';
import PageLoader from '@shared/ui/PageLoader';
import { toast } from '@shared/ui/Toast';
import { ROUTES } from '../routes/routePaths';
import { staffService, type ValidateInviteResponse } from '../services/staff.service';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState<ValidateInviteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Missing invitation token in URL.');
      return;
    }

    staffService
      .validateToken(token)
      .then((data) => {
        setInviteData(data);
        if (data.name) setName(data.name);
      })
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.message || 'Invalid or expired invitation link. Please request a new invite.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await staffService.acceptInvitation({
        token,
        name: name.trim(),
        password,
      });

      setIsSuccess(true);
      toast.success('Your administrator account is now active!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to complete invitation setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f3f9] flex items-center justify-center p-4">
        <PageLoader variant="mascot" size="md" text="Validating invitation token..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Velzon Brand */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#299cdb] to-[#405189] flex items-center justify-center text-white shadow-md mx-auto mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">VELZON CONSOLE</h2>
        <p className="text-xs text-slate-500 mt-1">Administrator Team Onboarding</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-md border border-slate-200/90 rounded-lg sm:px-9">
          {errorMessage ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Invitation Invalid or Expired</h3>
                <p className="text-xs text-slate-500 mt-1">{errorMessage}</p>
              </div>
              <div className="pt-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 text-xs font-semibold rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Return to Console Login
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Welcome to the Team!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your administrator account has been provisioned and your password is set.
                </p>
              </div>
              <div className="pt-3">
                <Link
                  to={ROUTES.LOGIN}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-md text-white bg-[#299cdb] hover:bg-[#2283b8] transition-colors shadow-xs"
                >
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md">
                <p className="text-[11px] text-slate-400">Invited Email Address</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{inviteData?.email}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] text-slate-500">Assigned Role:</span>
                  <span className="text-[11px] font-bold text-[#299cdb]">
                    {ROLE_LABELS[inviteData?.role || 'ADMIN']}
                  </span>
                </div>
              </div>

              <InputField
                label="Full Name"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <PasswordField
                label="Create Password"
                required
                showStrengthMeter
                placeholder="Enter at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordField
                label="Confirm Password"
                required
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  className="py-2.5 text-xs shadow-xs"
                >
                  Complete Setup & Join Team
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
