import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';
import CustomerLayout from '../../components/layout/CustomerLayout';
import InputField from '../../components/common/InputField';
import PasswordField from '../../components/common/PasswordField';
import Button from '../../components/common/Button';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

export default function CustomerLoginPage() {
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
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/');
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout showRail={false}>
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {errorMessage && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Customer Login Form */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
                Sign in to access your orders, wishlist, and profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <InputField
                label="Email Address"
                type="email"
                required
                name="email"
                placeholder="stevenjob@gmail.com"
                value={formData.email}
                onChange={handleChange}
                onClear={() => setFormData((prev) => ({ ...prev, email: '' }))}
                clearable
                error={fieldErrors.email}
              />

              <PasswordField
                label="Password"
                required
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                showStrengthMeter={false}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#2A3B5C] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                  className="py-3 text-sm font-semibold rounded-md cursor-pointer"
                >
                  Sign In
                </Button>
              </div>

              {/* Customer Registration Callout */}
              <p className="pt-2 text-center text-xs text-slate-500">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  Create customer account
                </Link>
              </p>
            </form>
          </div>

          {/* Right: Social Sign-in Box */}
          <div className="lg:col-span-5 lg:pt-14 flex items-center justify-center">
            <SocialAuthButtons />
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
