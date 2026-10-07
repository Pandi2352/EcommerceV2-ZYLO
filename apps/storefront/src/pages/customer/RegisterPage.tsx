import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Clock, ArrowRight, CheckCircle2, RotateCw, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import { useAuth } from '@shared/auth/AuthContext';
import { authService } from '@shared/api/auth.service';
import { useAuthProviders } from '../../features/auth/hooks/useAuthProviders';
import AuthSplitLayout from '../../features/auth/components/AuthSplitLayout';
import SocialAuthButtons from '../../features/auth/components/SocialAuthButtons';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';
import { toast } from '@shared/ui/Toast';

export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { registerWithOtp } = useAuth();
  const { google } = useAuthProviders();

  // 'email' -> Step 1 (email only)
  // 'verify' -> Step 2 (Amazon-style OTP verification & password creation)
  const [step, setStep] = useState<'email' | 'verify'>('email');

  // Step 1 State
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Step 2 State
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step2Errors, setStep2Errors] = useState<{
    otp?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // 60-second cooldown timer for resend OTP (Amazon style)
  const [cooldown, setCooldown] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  // Validate Email
  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Enter your email address');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Step 1: Submit email to request OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateEmail(email)) return;

    setSendingOtp(true);
    try {
      const res = await authService.sendRegistrationOtp(email.trim());
      setStep('verify');
      setCooldown(res.cooldownSeconds || 60);
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send verification code';
      setGeneralError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || sendingOtp) return;
    setGeneralError('');
    setSendingOtp(true);
    try {
      const res = await authService.sendRegistrationOtp(email.trim());
      setCooldown(res.cooldownSeconds || 60);
      toast.success('A new OTP has been sent to your email.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend verification code';
      setGeneralError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Validate fields
  const validateStep2 = (): boolean => {
    const errs: typeof step2Errors = {};

    if (!otp.trim()) {
      errs.otp = 'Enter the 6-digit verification code';
    } else if (!/^\d{6}$/.test(otp.trim())) {
      errs.otp = 'Verification code must be exactly 6 digits';
    }

    if (!name.trim()) {
      errs.name = 'Enter your name';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!password) {
      errs.password = 'Enter a password';
    } else if (password.length < 8) {
      errs.password = 'Passwords must be at least 8 characters';
    } else if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(password)) {
      errs.password = 'Password must include both letters and numbers';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Type your password again';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2: Submit OTP + Name + Password
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateStep2()) return;

    setVerifying(true);
    try {
      await registerWithOtp({
        email: email.trim(),
        otp: otp.trim(),
        name: name.trim(),
        password,
      });

      toast.success('Account created and verified! Welcome to ZYLO.');
      navigate(ROUTES.CUSTOMER.HOME, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      setGeneralError(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthSplitLayout
      title={step === 'email' ? 'Create Account' : 'Verify email address'}
      subtitle={
        step === 'email'
          ? 'Enter your email to receive an OTP verification code.'
          : `To verify your email, we've sent a One Time Password (OTP) to ${email}`
      }
      showRail={false}
      aside={step === 'email' && google ? <SocialAuthButtons mode="signup" redirect={ROUTES.CUSTOMER.HOME} /> : undefined}
    >
      <div className="max-w-md">
        {generalError && (
          <div className="mb-5">
            <Alert tone="error">{generalError}</Alert>
          </div>
        )}

        {/* STEP 1: Email Only */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  autoFocus
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                    emailError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-amber-600 focus:ring-amber-600 bg-white'
                  }`}
                />
              </div>
              {emailError && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {emailError}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={sendingOtp}
                className="py-3 text-sm font-semibold cursor-pointer shadow-none"
              >
                Continue
              </Button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              By creating an account, you agree to ZYLO's{' '}
              <Link to={ROUTES.CUSTOMER.TERMS} className="text-slate-800 hover:text-amber-600 underline font-medium">
                Conditions of Use
              </Link>{' '}
              and Privacy Notice.
            </p>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link to={ROUTES.CUSTOMER.LOGIN} className="font-semibold text-amber-600 hover:text-amber-700 underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: Amazon-style OTP Verification & Account Creation */}
        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} noValidate className="space-y-4">
            {/* Email notification bar with Change button */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-slate-700 truncate">
                  OTP sent to <strong className="text-slate-900">{email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setGeneralError('');
                }}
                className="text-amber-700 hover:text-amber-800 font-semibold underline shrink-0 cursor-pointer ml-2"
              >
                Change
              </button>
            </div>

            {/* Enter OTP */}
            <div>
              <label htmlFor="reg-otp" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Enter OTP <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (step2Errors.otp) setStep2Errors((prev) => ({ ...prev, otp: undefined }));
                }}
                autoFocus
                placeholder="6-digit code"
                className={`w-full px-3.5 py-2.5 text-center font-mono tracking-[0.3em] text-lg font-bold border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                  step2Errors.otp
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-amber-600 focus:ring-amber-600'
                }`}
              />
              {step2Errors.otp && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step2Errors.otp}
                </p>
              )}
            </div>

            {/* 1-Minute Cooldown & Resend OTP Notification (Amazon style) */}
            <div className="py-1">
              {cooldown > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Wait <strong className="text-slate-700">{cooldown}s</strong> before requesting a new OTP.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 active:text-amber-800 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
                  <span>Didn't receive the OTP? Resend OTP</span>
                </button>
              )}
            </div>

            {/* Your Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (step2Errors.name) setStep2Errors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoComplete="name"
                  placeholder="First and last name"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                    step2Errors.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-amber-600 focus:ring-amber-600'
                  }`}
                />
              </div>
              {step2Errors.name && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step2Errors.name}
                </p>
              )}
            </div>

            {/* Create Password */}
            <div>
              <label htmlFor="reg-pwd" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Create a Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-pwd"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (step2Errors.password) setStep2Errors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`w-full px-3.5 pr-10 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                    step2Errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-amber-600 focus:ring-amber-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Passwords must be at least 8 characters and contain letters and numbers.
              </p>
              {step2Errors.password && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step2Errors.password}
                </p>
              )}
            </div>

            {/* Re-enter Password */}
            <div>
              <label htmlFor="reg-confirm-pwd" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Re-enter Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-confirm-pwd"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (step2Errors.confirmPassword) setStep2Errors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className={`w-full px-3.5 pr-10 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                    step2Errors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-amber-600 focus:ring-amber-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {step2Errors.confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-rose-500 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {step2Errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={verifying}
                className="py-3 text-sm font-semibold cursor-pointer shadow-none"
              >
                Create your ZYLO account
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link to={ROUTES.CUSTOMER.LOGIN} className="font-semibold text-amber-600 hover:text-amber-700 underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthSplitLayout>
  );
}
