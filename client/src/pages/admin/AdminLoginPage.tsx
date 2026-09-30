import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';
import ZyloLogo from '../../components/common/ZyloLogo';
import InputField from '../../components/common/InputField';
import PasswordField from '../../components/common/PasswordField';
import Button from '../../components/common/Button';

/**
 * Admin Login Page
 * STRICT ARCHITECTURAL RULE:
 * Only for internal staff/administrators. No public registration exists for admin.
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
      errors.email = 'Admin email is required';
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <ZyloLogo variant="full" size="lg" theme="dark" badge="ADMIN PORTAL" />
        <h1 className="mt-6 text-2xl font-bold text-white tracking-tight">
          Administrator Control Panel
        </h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Authorized personnel only. All access attempts are audited.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800 border border-slate-700 rounded-md p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-md bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Staff Email"
              type="email"
              required
              name="email"
              placeholder="admin@zylo.internal"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />

            <PasswordField
              label="Secret Key / Password"
              required
              name="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              showStrengthMeter={false}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-semibold rounded-md"
                leftIcon={<Lock className="w-4 h-4" />}
              >
                Authenticate & Access
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>256-bit AES encrypted internal gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
