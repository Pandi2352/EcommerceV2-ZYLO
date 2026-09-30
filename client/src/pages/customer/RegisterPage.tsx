import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';
import CustomerLayout from '../../components/layout/CustomerLayout';
import InputField from '../../components/common/InputField';
import PasswordField from '../../components/common/PasswordField';
import Button from '../../components/common/Button';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

/**
 * Customer Registration Page (Customer Storefront Only)
 * Matches reference UI split-layout with zero shadows and rounded-md borders.
 */
export default function CustomerRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (errorMessage) setErrorMessage(null);
  };

  const handleClear = (field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and policy to register';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMessage('Account created successfully! Welcome to Zylo.');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout showRail={true}>
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        {/* Global Feedback Banners */}
        {successMessage && (
          <div className="mb-8 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className="text-emerald-700 text-xs mt-0.5">Redirecting you to the storefront...</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Two-Column Registration Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
                Access to all features. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <InputField
                label="Full Name"
                required
                name="name"
                placeholder="Steven job"
                value={formData.name}
                onChange={handleChange}
                onClear={() => handleClear('name')}
                clearable
                error={fieldErrors.name}
              />

              {/* Email */}
              <InputField
                label="Email"
                type="email"
                required
                name="email"
                placeholder="stevenjob@gmail.com"
                value={formData.email}
                onChange={handleChange}
                onClear={() => handleClear('email')}
                clearable
                error={fieldErrors.email}
              />

              {/* Username */}
              <InputField
                label="Username"
                required
                name="username"
                placeholder="stevenjob"
                value={formData.username}
                onChange={handleChange}
                onClear={() => handleClear('username')}
                clearable
                error={fieldErrors.username}
              />

              {/* Password */}
              <PasswordField
                label="Password"
                required
                name="password"
                placeholder="******************"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                showStrengthMeter={true}
              />

              {/* Re-Password */}
              <PasswordField
                label="Re-Password"
                required
                name="confirmPassword"
                placeholder="******************"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                showStrengthMeter={false}
              />

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#2A3B5C] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    By clicking Register button, you agree our{' '}
                    <a
                      href="#terms"
                      className="text-slate-700 hover:text-slate-900 underline font-medium"
                    >
                      terms and policy
                    </a>
                    .
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.terms}</p>
                )}
              </div>

              {/* Sign Up Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                  className="py-3 text-sm font-semibold rounded-md"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Social Sign-up Accounts */}
          <div className="lg:col-span-5 lg:pt-14 flex items-center justify-center">
            <SocialAuthButtons />
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
