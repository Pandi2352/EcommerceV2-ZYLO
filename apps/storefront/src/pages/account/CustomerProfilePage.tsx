import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/auth/AuthContext';
import { accountService } from '@shared/api/account.service';
import { toast } from '@shared/ui/Toast';
import AccountLayout from '../../features/account/components/AccountLayout';
import { User, Phone, Mail, Camera, Check, Shield, Calendar, Loader2 } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
];

export const CustomerProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPreset = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setShowPresets(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const response = await accountService.updateProfile({
        name: formData.name.trim(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
      });

      setUser(response.user);
      toast.success(response.message || 'Profile updated successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Main Profile Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:items-start space-y-4">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-none">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPresets((prev) => !prev)}
                  className="absolute bottom-0 right-0 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors cursor-pointer border-2 border-white"
                  title="Choose avatar image"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center sm:text-left">
                <button
                  type="button"
                  onClick={() => setShowPresets((prev) => !prev)}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  {showPresets ? 'Close avatar picker' : 'Pick from presets'}
                </button>
              </div>

              {/* Preset Avatars Drawer / Picker */}
              {showPresets && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <p className="text-xs font-medium text-slate-600 mb-2">Choose an avatar:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(url)}
                        className={`w-11 h-11 rounded-full border-2 overflow-hidden transition-transform hover:scale-105 cursor-pointer ${
                          formData.avatarUrl === url
                            ? 'border-amber-600 ring-2 ring-amber-500/20'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="flex-1 w-full space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Update your public name and contact details.</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="e.g. Morgan"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Email is associated with your account authentication.
                  </span>
                </div>
              </div>

              {/* Avatar URL direct input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors text-slate-700"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Details & Security Highlights Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-start gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Email Verification</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.isEmailVerified
                  ? 'Your email address is verified and active.'
                  : 'Your email address is unverified. Please check your inbox.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-start gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Member Since</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered account since {joinedDate}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
};

export default CustomerProfilePage;
