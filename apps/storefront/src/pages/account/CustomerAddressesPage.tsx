import React, { useEffect, useState } from 'react';
import { accountService } from '@shared/api/account.service';
import type { CustomerAddress, AddressPayload } from '@shared/types/account';
import { toast } from '@shared/ui/Toast';
import AccountLayout from '../../features/account/components/AccountLayout';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  X,
  Loader2,
  Home,
} from 'lucide-react';

interface FormErrors {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
}

export const CustomerAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<AddressPayload>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await accountService.getAddresses();
      setAddresses(res.addresses || []);
    } catch (err: any) {
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      phone: '',
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setForm({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || 'United States',
      phone: addr.phone || '',
      isDefault: addr.isDefault,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.street.trim()) {
      errs.street = 'Street address is required';
    } else if (form.street.trim().length < 5) {
      errs.street = 'Street address must be at least 5 characters';
    }

    if (!form.city.trim()) {
      errs.city = 'City is required';
    }

    if (!form.state.trim()) {
      errs.state = 'State / Province is required';
    }

    if (!form.postalCode.trim()) {
      errs.postalCode = 'Postal / ZIP code is required';
    } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(form.postalCode.trim())) {
      errs.postalCode = 'Please enter a valid postal / ZIP code';
    }

    if (form.phone && form.phone.trim().length > 0) {
      // Basic phone format check: digits, hyphens, plus, parenthesis, spaces
      if (!/^[\d\+\-\(\)\s]{7,20}$/.test(form.phone.trim())) {
        errs.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingAddress) {
        const id = editingAddress._id || editingAddress.id!;
        const res = await accountService.updateAddress(id, form);
        setAddresses(res.addresses);
        toast.success(res.message || 'Address updated successfully!');
      } else {
        const res = await accountService.addAddress(form);
        setAddresses(res.addresses);
        toast.success(res.message || 'Address added successfully!');
      }
      closeModal();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save address';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addr: CustomerAddress) => {
    const id = addr._id || addr.id!;
    if (!window.confirm('Are you sure you want to delete this shipping address?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await accountService.deleteAddress(id);
      setAddresses(res.addresses);
      toast.success(res.message || 'Address deleted');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete address';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addr: CustomerAddress) => {
    const id = addr._id || addr.id!;
    setSettingDefaultId(id);
    try {
      const res = await accountService.setDefaultAddress(id);
      setAddresses(res.addresses);
      toast.success('Default shipping address updated');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to set default address';
      toast.error(msg);
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-md p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved Addresses</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your delivery addresses and set your preferred default shipping location.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-md">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4 border border-amber-100">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No addresses saved yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Add a delivery address to ensure fast, seamless checkout when you place your orders.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => {
              const id = addr._id || addr.id!;
              const isDefault = Boolean(addr.isDefault);
              const isSetting = settingDefaultId === id;
              const isDeleting = deletingId === id;

              return (
                <div
                  key={id}
                  className={`relative bg-white border rounded-md p-5 flex flex-col justify-between transition-all ${
                    isDefault
                      ? 'border-amber-600/80 ring-1 ring-amber-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                          Shipping Address
                        </span>
                      </div>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          DEFAULT
                        </span>
                      )}
                    </div>

                    {/* Address Text */}
                    <div className="space-y-1 text-sm text-slate-700 font-normal">
                      <p className="font-semibold text-slate-900">{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-slate-500 text-xs">{addr.country}</p>
                    </div>

                    {/* Phone */}
                    {addr.phone && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{addr.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(addr)}
                          disabled={isSetting}
                          className="text-slate-600 hover:text-amber-600 font-semibold cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {isSetting ? 'Setting...' : 'Set as default'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(addr)}
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Add / Edit Address */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg overflow-hidden shadow-none animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Street Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    className={`w-full px-3.5 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                      errors.street
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-amber-600 focus:ring-amber-600'
                    }`}
                  />
                  {errors.street && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.street}
                    </p>
                  )}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Springfield"
                      className={`w-full px-3.5 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                        errors.city
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-amber-600 focus:ring-amber-600'
                      }`}
                    />
                    {errors.city && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State / Province <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="e.g. OR or California"
                      className={`w-full px-3.5 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                        errors.state
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-amber-600 focus:ring-amber-600'
                      }`}
                    />
                    {errors.state && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Postal Code & Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal / ZIP Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="e.g. 97477"
                      className={`w-full px-3.5 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                        errors.postalCode
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-amber-600 focus:ring-amber-600'
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <select
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-white cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone (for delivery courier)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 789-0123"
                    className={`w-full px-3.5 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                      errors.phone
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-amber-600 focus:ring-amber-600'
                    }`}
                  />
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Is Default Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      Set as default shipping address
                    </span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-none"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default CustomerAddressesPage;
