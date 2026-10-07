import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  Plus,
  CreditCard,
  Banknote,
  ChevronRight,
  Tag,
  Loader2,
  X,
  Phone,
  Home,
  Check,
} from 'lucide-react';
import { useCart } from '../../features/cart/context/CartContext';
import { useAuth } from '@shared/auth/AuthContext';
import { accountService } from '@shared/api/account.service';
import { ordersService } from '@shared/api/orders.service';
import type { CustomerAddress } from '@shared/types/account';
import {
  DeliveryMethod,
  PaymentMethod,
  type OrderShippingAddress,
} from '@shared/types/order';
import { ROUTES } from '../../routes/routePaths';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    savings,
    qualifiesForFreeShipping,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    refreshCart,
  } = useCart();

  // Selected items only
  const checkoutItems = items.filter((i) => i.selected !== false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form State
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('US');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Checkout Options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.STANDARD);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [notes, setNotes] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Load saved addresses
  useEffect(() => {
    let isMounted = true;
    accountService
      .getAddresses()
      .then((res) => {
        if (!isMounted) return;
        const addrs = res.addresses || [];
        setSavedAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else {
          setIsAddingNewAddress(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load saved addresses:', err);
        setIsAddingNewAddress(true);
      })
      .finally(() => {
        if (isMounted) setLoadingAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live financials
  const effectiveShipping =
    deliveryMethod === DeliveryMethod.EXPRESS
      ? 12.99
      : qualifiesForFreeShipping || appliedCoupon === 'FREESHIP'
      ? 0.0
      : 5.99;

  let couponDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon === 'ZYLO10') couponDiscount = +(subtotal * 0.1).toFixed(2);
    if (appliedCoupon === 'ZYLO20') couponDiscount = +(subtotal * 0.2).toFixed(2);
    if (appliedCoupon === 'WELCOME5') couponDiscount = Math.min(5, subtotal);
  }

  const estimatedTax = +(subtotal * 0.08).toFixed(2);
  const grandTotal = +(Math.max(0, subtotal + effectiveShipping + estimatedTax - couponDiscount)).toFixed(2);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    if (success) setCouponInput('');
    setApplyingCoupon(false);
  };

  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newState.trim() || !newPostalCode.trim()) {
      toast.error('Please fill in all required address fields');
      return;
    }

    try {
      if (saveToAccount) {
        const res = await accountService.addAddress({
          street: newStreet.trim(),
          city: newCity.trim(),
          state: newState.trim(),
          postalCode: newPostalCode.trim(),
          country: newCountry.trim() || 'US',
          phone: newPhone.trim() || undefined,
          isDefault: savedAddresses.length === 0,
        });
        setSavedAddresses(res.addresses);
        const created = res.addresses[res.addresses.length - 1];
        if (created) setSelectedAddressId(created._id);
      }
      setIsAddingNewAddress(false);
      toast.success('Address set for this delivery');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      toast.error('Your cart has no selected items for checkout');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms and Conditions to place your order');
      return;
    }

    // Resolve shipping address
    let finalShippingAddress: OrderShippingAddress | null = null;

    if (isAddingNewAddress) {
      if (!newStreet.trim() || !newCity.trim() || !newState.trim() || !newPostalCode.trim()) {
        toast.error('Please complete your delivery address');
        return;
      }
      finalShippingAddress = {
        street: newStreet.trim(),
        city: newCity.trim(),
        state: newState.trim(),
        postalCode: newPostalCode.trim(),
        country: newCountry.trim() || 'US',
        phone: newPhone.trim() || user?.phone || '',
      };
    } else {
      const selected = savedAddresses.find((a) => a._id === selectedAddressId);
      if (!selected) {
        toast.error('Please select or add a shipping address');
        return;
      }
      finalShippingAddress = {
        street: selected.street,
        city: selected.city,
        state: selected.state,
        postalCode: selected.postalCode,
        country: selected.country || 'US',
        phone: selected.phone || user?.phone || '',
      };
    }

    try {
      setIsSubmitting(true);
      const res = await ordersService.checkout({
        shippingAddress: finalShippingAddress,
        deliveryMethod,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        notes: notes.trim() || undefined,
        termsAccepted,
      });

      // Refresh cart context (will clear purchased items)
      await refreshCart();

      toast.success(`Order placed successfully! Order #${res.order.orderNumber}`);
      navigate(`/checkout/success/${res.order.orderNumber}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to place order. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is completely empty
  if (checkoutItems.length === 0) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-md p-8 text-center shadow-none">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">No Items to Checkout</h1>
          <p className="text-xs text-slate-500 mb-6">
            Your shopping cart has no selected items ready for checkout. Explore our catalog and add products to proceed.
          </p>
          <Link to={ROUTES.CUSTOMER.SHOP}>
            <Button variant="primary" size="md">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header & Security Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 select-none">
              <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-slate-800 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link to={ROUTES.CUSTOMER.CART} className="hover:text-slate-800 transition-colors">
                Cart
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-bold">Secure Checkout</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted & Protected</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-step Accordion / Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
                </div>
                {!isAddingNewAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Saved Address Cards */}
              {!isAddingNewAddress && (
                <div className="space-y-3">
                  {loadingAddresses ? (
                    <div className="py-6 flex justify-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddressId(addr._id)}
                          className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shippingAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr._id)}
                              className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2 font-bold text-slate-900 mb-0.5">
                                <Home className="w-3.5 h-3.5 text-slate-500" />
                                <span>{user?.name}</span>
                                {addr.isDefault && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 leading-snug">{addr.street}</p>
                              <p className="text-slate-600 leading-snug">
                                {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                              </p>
                              {addr.phone && (
                                <p className="text-slate-500 mt-1 flex items-center gap-1 text-[11px]">
                                  <Phone className="w-3 h-3" /> {addr.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500 py-2">
                      No saved addresses found. Please enter a delivery address below.
                    </p>
                  )}
                </div>
              )}

              {/* Inline New Address Form */}
              {isAddingNewAddress && (
                <form onSubmit={handleCreateNewAddress} className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">New Address Details</span>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Suite 100"
                      className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="e.g. Springfield"
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">State / Province *</label>
                      <input
                        type="text"
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="e.g. OR or California"
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ZIP / Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        placeholder="e.g. 97477"
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Delivery Contact Phone</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full text-xs py-2 px-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveToAccount"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="saveToAccount" className="text-xs text-slate-600 cursor-pointer select-none">
                      Save this address to my account for future orders
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="submit" variant="primary" size="sm">
                      Use This Address
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Delivery Options */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-slate-900">Delivery Speed</h2>
              </div>

              <div className="space-y-3">
                {/* Standard Shipping */}
                <label
                  className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    deliveryMethod === DeliveryMethod.STANDARD
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.STANDARD}
                      checked={deliveryMethod === DeliveryMethod.STANDARD}
                      onChange={() => setDeliveryMethod(DeliveryMethod.STANDARD)}
                      className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Standard Delivery (3–5 Business Days)</p>
                      <p className="text-slate-500 text-[11px]">
                        Reliable ground courier delivery directly to your door
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {qualifiesForFreeShipping || appliedCoupon === 'FREESHIP' ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      '$5.99'
                    )}
                  </span>
                </label>

                {/* Express Shipping */}
                <label
                  className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    deliveryMethod === DeliveryMethod.EXPRESS
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={DeliveryMethod.EXPRESS}
                      checked={deliveryMethod === DeliveryMethod.EXPRESS}
                      onChange={() => setDeliveryMethod(DeliveryMethod.EXPRESS)}
                      className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Express Priority Air (1–2 Business Days)</p>
                      <p className="text-slate-500 text-[11px]">
                        Fast-tracked fulfillment with priority air carrier
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">$12.99</span>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery (COD) */}
                <label
                  className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    paymentMethod === PaymentMethod.COD
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.COD}
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={() => setPaymentMethod(PaymentMethod.COD)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Cash on Delivery (COD)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                          Recommended
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Pay in cash or with any UPI app when the courier arrives at your address.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === PaymentMethod.COD && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </label>

                {/* Online Payment (Mock Gateway) */}
                <label
                  className={`p-3.5 rounded-md border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    paymentMethod === PaymentMethod.ONLINE
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={PaymentMethod.ONLINE}
                      checked={paymentMethod === PaymentMethod.ONLINE}
                      onChange={() => setPaymentMethod(PaymentMethod.ONLINE)}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span>Credit / Debit Card & UPI Gateway</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Instant 256-bit automated simulated payment gateway checkout.
                      </p>
                    </div>
                  </div>
                  {paymentMethod === PaymentMethod.ONLINE && (
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </label>
              </div>
            </div>

            {/* Step 4: Delivery Notes & Instructions */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please leave at front desk, ring apartment bell 4B..."
                className="w-full text-xs p-3 border border-slate-200 rounded-md focus:outline-none focus:border-amber-500 resize-none text-slate-700"
              />
            </div>
          </div>

          {/* Right Column: Order Review & Placement */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none sticky top-24">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
                Order Review ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List Preview */}
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto my-3 pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded border border-slate-200 object-contain p-1 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                      {item.variantTitle && (
                        <p className="text-[11px] text-slate-400 truncate">{item.variantTitle}</p>
                      )}
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Box */}
              <div className="pt-3 pb-4 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span>Code "{appliedCoupon}" applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. ZYLO10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md uppercase focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={applyingCoupon || !couponInput.trim()}
                      className="px-3 py-2 text-xs font-bold rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      {applyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </form>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span>
                    {effectiveShipping === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${effectiveShipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <span className="text-xl font-black text-slate-900">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {savings > 0 && (
                  <p className="text-[11px] text-emerald-600 font-semibold text-right pt-0.5">
                    Total Savings: ${savings.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Terms Acceptance Checkbox */}
              <div className="pt-4 pb-2">
                <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>
                    By clicking "Place Your Order", you agree to ZYLO's{' '}
                    <Link to={ROUTES.CUSTOMER.TERMS} className="text-amber-600 underline">
                      Terms of Service
                    </Link>{' '}
                    and return policy.
                  </span>
                </label>
              </div>

              {/* Action: Place Order */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSubmitting || !termsAccepted}
                  onClick={handlePlaceOrder}
                  className="w-full py-3 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Place Your Order · ${grandTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Authentic Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>7-Day Return Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
