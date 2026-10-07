import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import type { AdminCustomerDetails } from '@shared/types/customer';
import { Drawer } from '@shared/ui/Drawer';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { customersService } from '@shared/api/customers.service';
import { formatPrice } from '@shared/utils/currency';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onStatusUpdated: () => void;
  currencySymbol?: string;
}

export const CustomerDetailsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  customerId,
  onStatusUpdated,
  currencySymbol = '$',
}) => {
  const [details, setDetails] = useState<AdminCustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (customerId && isOpen) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const data = await customersService.getDetails(customerId);
          setDetails(data);
        } catch {
          toast.error('Failed to load customer profile details');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDetails(null);
    }
  }, [customerId, isOpen]);

  if (!customerId) return null;

  const customer = details?.customer;
  const orders = details?.orders || [];
  const stats = details?.stats;

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      setUpdatingStatus(true);
      await customersService.toggleStatus(customer._id, !customer.isActive);
      toast.success(
        `Customer account is now ${!customer.isActive ? 'Active' : 'Suspended'}`,
      );
      // Reload details
      const refreshed = await customersService.getDetails(customer._id);
      setDetails(refreshed);
      onStatusUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update account status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? customer.name : 'Customer Profile'}
      description="Detailed customer profile, lifetime value, delivery addresses, and past orders."
      size="xl"
    >
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading customer profile...</p>
        </div>
      ) : !customer ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-xs">Customer information unavailable.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-md border flex items-center justify-between ${
              customer.isActive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {customer.isActive ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Ban className="w-4 h-4 text-rose-600" />
              )}
              <span className="text-xs font-semibold">
                Account Status: {customer.isActive ? 'Active & In Good Standing' : 'Suspended / Deactivated'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              isLoading={updatingStatus}
              className={`text-xs ${
                customer.isActive
                  ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                  : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {customer.isActive ? 'Suspend Account' : 'Reactivate Account'}
            </Button>
          </div>

          {/* Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-md bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xl flex items-center justify-center shrink-0">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {customer._id}</p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Role: {customer.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Lifetime Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                {stats?.totalOrders ?? 0}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Lifetime Spend
              </span>
              <span className="text-lg font-bold text-emerald-600 font-mono mt-0.5 block">
                {formatPrice(stats?.lifetimeSpend ?? 0, { currencySymbol })}
              </span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Avg Order Value
              </span>
              <span className="text-lg font-bold text-indigo-600 font-mono mt-0.5 block">
                {formatPrice(stats?.averageOrderValue ?? 0, { currencySymbol })}
              </span>
            </div>
          </div>

          {/* Delivery Addresses */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Saved Delivery Addresses ({customer.addresses?.length || 0})
            </h4>

            {(!customer.addresses || customer.addresses.length === 0) ? (
              <p className="text-xs text-slate-400">No shipping addresses saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customer.addresses.map((addr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50/70 text-xs space-y-1 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {addr.name || 'Shipping Address'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{addr.street}</p>
                    <p className="text-slate-600">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-slate-500">{addr.country || 'US'}</p>
                    {addr.phone && <p className="text-slate-400">Phone: {addr.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
              Order History ({orders.length})
            </h4>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400">This customer has not placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Fulfillment</th>
                      <th className="py-2.5 px-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {o.orderNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {o.items?.length || 0} item{(o.items?.length || 0) > 1 ? 's' : ''}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {formatPrice(o.grandTotal, { currencySymbol })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              o.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : o.orderStatus === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
