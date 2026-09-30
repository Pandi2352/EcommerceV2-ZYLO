import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';
import ZyloLogo from '../../components/common/ZyloLogo';
import InputField from '../../components/common/InputField';
import PasswordField from '../../components/common/PasswordField';
import Button from '../../components/common/Button';
import CornerDots from '../../components/common/CornerDots';

/**
 * Admin Login Page (Optimized Light Mode with Corner Accent Dots)
 * - Harmonious centered alignment and logo placement
 * - Subtle corner accent dots (top-left & bottom-right only)
 * - Light-gray soft focus borders (no harsh dark outlines)
 * - Light-red border highlighting on empty/invalid field submit
 * - noValidate to suppress browser native popups
 * - Browser autofill tint overrides
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time clearance of field errors on user keystroke
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (errorMessage) setErrorMessage(null);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Staff email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid administrative email address';
    }

    if (!formData.password) {
      errors.password = 'Security key / password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (user.role !== 'ADMIN') {
        setErrorMessage('Access restricted: This account does not possess administrator credentials.');
        return;
      }

      navigate('/admin');
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* Subtle Corner Dots (Top-Left & Bottom-Right only) */}
      <CornerDots />

      {/* Main Login Card (Zero Shadows, Clean Borders) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8">
          {/* Brand Header inside Card — Aligned Left */}
          <div className="mb-6 text-left">
            <Link
              to="/"
              className="inline-flex items-center transition-transform duration-200 hover:scale-105 mb-4 cursor-pointer"
            >
              <ZyloLogo variant="full" size="md" theme="light" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Portal Sign In
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Authorized personnel only. All access attempts are strictly monitored.
            </p>
          </div>

          {/* Global Alert Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form with noValidate to trigger custom light-red border styling */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Work Email */}
            <InputField
              label="Work Email"
              type="email"
              name="email"
              required
              autoComplete="off"
              placeholder="name@zylo.internal"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={fieldErrors.email}
            />

            {/* Admin Password */}
            <PasswordField
              label="Security Key / Password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              showStrengthMeter={false}
            />

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                className="bg-[#2A3B5C] hover:bg-[#1E2B43] py-3 text-sm font-semibold rounded-md text-white cursor-pointer"
                leftIcon={<Lock className="w-4 h-4" />}
              >
                Authenticate & Access
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>256-bit SSL encrypted administrative channel</span>
          </div>
        </div>

        {/* Back to Customer Storefront Link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
