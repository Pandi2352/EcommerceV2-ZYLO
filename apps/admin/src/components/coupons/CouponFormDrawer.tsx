import React, { useState, useEffect } from 'react';
import {
  Tag,
  Sparkles,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Save,
} from 'lucide-react';
import type { Coupon, CouponDiscountType, CreateCouponPayload } from '@shared/types/coupon';
import { Drawer } from '@shared/ui/Drawer';
import { Button } from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';
import { toast } from '@shared/ui/Toast';
import { couponsService } from '@shared/api/coupons.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: Coupon | null;
  onSaved: () => void;
}

export const CouponFormDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  couponToEdit,
  onSaved,
}) => {
  const isEditing = Boolean(couponToEdit);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setDescription(couponToEdit.description || '');
      setDiscountType(couponToEdit.discountType);
      setDiscountValue(couponToEdit.discountValue);
      setMinOrderAmount(couponToEdit.minOrderAmount || 0);
      setMaxDiscountAmount(couponToEdit.maxDiscountAmount ? String(couponToEdit.maxDiscountAmount) : '');
      setStartDate(couponToEdit.startDate ? couponToEdit.startDate.slice(0, 10) : '');
      setEndDate(couponToEdit.endDate ? couponToEdit.endDate.slice(0, 10) : '');
      setUsageLimit(couponToEdit.usageLimit ? String(couponToEdit.usageLimit) : '');
      setPerUserLimit(couponToEdit.perUserLimit || 1);
      setIsActive(couponToEdit.isActive);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('PERCENTAGE');
      setDiscountValue(15);
      setMinOrderAmount(0);
      setMaxDiscountAmount('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setUsageLimit('');
      setPerUserLimit(1);
      setIsActive(true);
    }
  }, [couponToEdit, isOpen]);

  const handleGenerateCode = () => {
    const prefixes = ['FLASH', 'VIP', 'SAVE', 'PROMO', 'DEAL', 'ZYLO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const randomCode = `${prefix}${num}`;
    setCode(randomCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    if (discountType !== 'FREE_SHIPPING' && discountValue <= 0) {
      toast.error('Discount value must be greater than zero');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateCouponPayload = {
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        discountType,
        discountValue: discountType === 'FREE_SHIPPING' ? 0 : Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount.trim() ? Number(maxDiscountAmount) : null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit) || 1,
        isActive,
      };

      if (isEditing && couponToEdit) {
        await couponsService.update(couponToEdit._id, payload);
        toast.success(`Coupon "${payload.code}" updated successfully!`);
      } else {
        await couponsService.create(payload);
        toast.success(`Coupon "${payload.code}" created successfully!`);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Coupon: ${couponToEdit?.code}` : 'Create Promotional Coupon'}
      description="Configure discount rules, threshold requirements, validity dates, and redemption limits."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Real-time Voucher Live Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Preview Card</p>
          <div className="border border-dashed border-indigo-200 bg-white rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-600">
                {discountType === 'PERCENTAGE' && <Percent className="w-5 h-5" />}
                {discountType === 'FIXED' && <DollarSign className="w-5 h-5" />}
                {discountType === 'FREE_SHIPPING' && <Truck className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                  {code.trim().toUpperCase() || 'PROMOCODE'}
                </span>
                <p className="text-xs text-slate-500">
                  {description.trim() || 'Promotional store voucher'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-sm font-bold text-indigo-600">
                {discountType === 'PERCENTAGE' && `${discountValue || 0}% OFF`}
                {discountType === 'FIXED' && `$${discountValue || 0} FLAT OFF`}
                {discountType === 'FREE_SHIPPING' && 'FREE SHIPPING'}
              </span>
              <span className="text-xs text-slate-400">
                {minOrderAmount > 0 ? `Min spend: $${minOrderAmount}` : 'No minimum spend'}
              </span>
            </div>
          </div>
        </div>

        {/* Coupon Code & Generation */}
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="w-full uppercase font-mono font-bold tracking-wider px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
                  required
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleGenerateCode}
              className="h-10 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Generate
            </Button>
          </div>

          <InputField
            label="Campaign Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 20% off all catalog items on orders exceeding $75"
          />
        </div>

        {/* Discount Rules */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            Discount Rules & Model
          </h4>

          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Discount Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1.5 ${
                  discountType === 'PERCENTAGE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                Percentage
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FIXED')}
                className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1.5 ${
                  discountType === 'FIXED'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                Fixed Amount
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('FREE_SHIPPING')}
                className={`py-2 px-3 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1.5 ${
                  discountType === 'FREE_SHIPPING'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                Free Shipping
              </button>
            </div>
          </div>

          {/* Discount Value & Max Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {discountType !== 'FREE_SHIPPING' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Value ($)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
                  required
                />
              </div>
            )}

            {discountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Discount Cap ($) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 50 (max limit)"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Minimum Order Spend ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                placeholder="0 = no minimum"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Validity Dates & Usage Limits */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            Schedule & Usage Controls
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expiration Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Global Redemption Limit <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Uses Per Customer
              </label>
              <input
                type="number"
                min="1"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(Number(e.target.value))}
                placeholder="1"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Campaign Status</span>
              <span className="text-xs text-slate-500">
                {isActive ? 'Coupon is active and available for customer checkout' : 'Coupon is paused and disabled'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
