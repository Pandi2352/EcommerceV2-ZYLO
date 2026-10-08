import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Mail,
  Play,
  CheckCircle2,
  Clock,
  Tag,
  Eye,
  AlertCircle,
  Package,
  Check,
  X,
} from 'lucide-react';
import {
  FcHighPriority,
  FcFeedback,
  FcMoneyTransfer,
  FcPositiveDynamic,
  FcBarChart,
  FcClock,
} from 'react-icons/fc';
import { abandonedCartsService } from '@shared/api/abandoned-carts.service';
import type {
  AbandonedCartRecord,
  AbandonedCartMetrics,
  AbandonedCartStage,
} from '@shared/types/abandoned-cart';
import { toast } from '@shared/ui/Toast';
import { Button } from '@shared/ui/Button';

export const AbandonedCartsPage: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCartRecord[]>([]);
  const [metrics, setMetrics] = useState<AbandonedCartMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringJob, setTriggeringJob] = useState<boolean>(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  // Inspection Modal
  const [inspectCart, setInspectCart] = useState<AbandonedCartRecord | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, metricsRes] = await Promise.all([
        abandonedCartsService.list({ limit: 100 }),
        abandonedCartsService.getMetrics(),
      ]);
      setCarts(listRes.items || []);
      setMetrics(metricsRes);
    } catch (err) {
      console.error('Failed to load abandoned carts data:', err);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerJob = async () => {
    setTriggeringJob(true);
    try {
      const res = await abandonedCartsService.triggerJob();
      toast.success(
        `Recovery engine executed! Evaluated ${res.processedCount} carts and sent ${res.emailsSent} emails.`,
      );
      loadData();
    } catch (err) {
      toast.error('Failed to execute recovery job');
    } finally {
      setTriggeringJob(false);
    }
  };

  const handleSendManualEmail = async (id: string, email: string) => {
    setSendingEmailId(id);
    try {
      const res = await abandonedCartsService.sendEmail(id);
      toast.success(res.message || `Recovery email sent to ${email}`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch recovery email');
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleMarkRecovered = async (id: string) => {
    try {
      await abandonedCartsService.markRecovered(id);
      toast.success('Cart marked as recovered!');
      loadData();
      if (inspectCart?._id === id) {
        setInspectCart(null);
      }
    } catch (err) {
      toast.error('Failed to mark cart as recovered');
    }
  };

  // Filtered Carts
  const filteredCarts = useMemo(() => {
    return carts.filter((c) => {
      const matchSearch =
        !search.trim() ||
        c.customerName.toLowerCase().includes(search.toLowerCase()) ||
        c.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        c.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));

      const matchStage = selectedStage === 'ALL' || c.stage === selectedStage;

      return matchSearch && matchStage;
    });
  }, [carts, search, selectedStage]);

  const getStageBadge = (stage: AbandonedCartStage) => {
    switch (stage) {
      case 'STAGE_1_REMINDER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3 h-3 text-amber-500" />
            Stage 1 (1h Reminder)
          </span>
        );
      case 'STAGE_2_DISCOUNT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <Tag className="w-3 h-3 text-indigo-500" />
            Stage 2 (10% Voucher)
          </span>
        );
      case 'STAGE_3_FINAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Stage 3 (Final Notice)
          </span>
        );
      case 'RECOVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Recovered Order
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/80">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Abandoned Cart Automated Recovery
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Re-engage shoppers with multi-stage recovery emails sent at 1 hour, 24 hours, and 72 hours with 1-click cart restore links and dynamic incentive discounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleTriggerJob}
            disabled={triggeringJob}
            leftIcon={<Play className={`w-3.5 h-3.5 ${triggeringJob ? 'animate-spin' : ''}`} />}
          >
            {triggeringJob ? 'Evaluating...' : 'Run Engine Now'}
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Abandoned
            </span>
            <FcHighPriority className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5">
            {metrics?.totalAbandoned ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tracked idle baskets</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              At-Risk Value
            </span>
            <FcClock className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-amber-600 mt-1.5">
            ${metrics?.abandonedCartValue?.toFixed(2) ?? '0.00'}
          </div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">Unpurchased pipeline</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Emails Sent
            </span>
            <FcFeedback className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-indigo-600 mt-1.5">
            {metrics?.totalEmailsSent ?? 0}
          </div>
          <div className="text-[10px] text-indigo-700/80 mt-0.5">Sequence dispatches</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Recovered Carts
            </span>
            <FcMoneyTransfer className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-emerald-600 mt-1.5">
            {metrics?.recoveredCount ?? 0}
          </div>
          <div className="text-[10px] text-emerald-700/80 mt-0.5">Purchases completed</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Recovered Revenue
            </span>
            <FcPositiveDynamic className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1.5">
            ${metrics?.recoveredRevenue?.toFixed(2) ?? '0.00'}
          </div>
          <div className="text-[10px] text-emerald-700/80 mt-0.5">Recaptured sales</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Conversion Rate
            </span>
            <FcBarChart className="w-5 h-5" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5">
            {metrics?.conversionRate ?? 0}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recovery efficiency</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email, or product..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Stage:</span>
          {[
            { id: 'ALL', label: 'All Stages' },
            { id: 'STAGE_1_REMINDER', label: 'Stage 1 (1h)' },
            { id: 'STAGE_2_DISCOUNT', label: 'Stage 2 (24h)' },
            { id: 'STAGE_3_FINAL', label: 'Stage 3 (72h)' },
            { id: 'RECOVERED', label: 'Recovered' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStage(st.id)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedStage === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carts Table */}
      <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Reserved Items</th>
                <th className="px-4 py-3">Cart Total</th>
                <th className="px-4 py-3">Sequence Stage</th>
                <th className="px-4 py-3">Emails Sent</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading abandoned carts...
                  </td>
                </tr>
              ) : filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No abandoned carts match your query.
                  </td>
                </tr>
              ) : (
                filteredCarts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                          {c.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{c.customerName}</div>
                          <div className="text-[11px] text-slate-400">{c.customerEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reserved Items */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {c.items.slice(0, 3).map((it, idx) => (
                            <div
                              key={idx}
                              title={`${it.name} (x${it.quantity})`}
                              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-white shrink-0"
                            >
                              {it.imageUrl ? (
                                <img
                                  src={it.imageUrl}
                                  alt={it.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-slate-400 mx-auto mt-1" />
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 ml-1">
                          {c.itemCount} {c.itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>

                    {/* Cart Total */}
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900 text-xs">
                        ${c.cartTotal.toFixed(2)}
                      </div>
                      {c.discountCouponCode && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          Code: {c.discountCouponCode}
                        </div>
                      )}
                    </td>

                    {/* Sequence Stage */}
                    <td className="px-4 py-3.5">{getStageBadge(c.stage)}</td>

                    {/* Emails Sent */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">{c.emailsSentCount}</span>
                        <span className="text-[11px] text-slate-400">sent</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectCart(c)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-semibold inline-flex items-center gap-1"
                          title="Inspect cart details"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>

                        {c.status === 'ABANDONED' && (
                          <button
                            type="button"
                            onClick={() => handleSendManualEmail(c._id, c.customerEmail)}
                            disabled={sendingEmailId === c._id}
                            className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer text-[11px] font-bold inline-flex items-center gap-1 disabled:opacity-50"
                            title="Dispatch recovery email"
                          >
                            <Mail className={`w-3 h-3 ${sendingEmailId === c._id ? 'animate-spin' : ''}`} />
                            Send Email
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Inspection Modal */}
      {inspectCart && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                Abandoned Cart Inspection
              </h3>
              <button
                type="button"
                onClick={() => setInspectCart(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 p-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-sm">{inspectCart.customerName}</div>
                <div className="text-slate-500 text-xs">{inspectCart.customerEmail}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Total Basket Value</div>
                <div className="text-base font-extrabold text-slate-900">
                  ${inspectCart.cartTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Stage info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Recovery Stage:</span>
              <div>{getStageBadge(inspectCart.stage)}</div>
            </div>

            {inspectCart.discountCouponCode && (
              <div className="flex items-center justify-between text-xs p-2 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-emerald-800 font-semibold">Active Recovery Coupon:</span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {inspectCart.discountCouponCode}
                </span>
              </div>
            )}

            {/* Reserved Items List */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">
                Reserved Items ({inspectCart.items.length}):
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {inspectCart.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400 mx-auto mt-2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate text-xs">
                          {it.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Qty: {it.quantity} &bull; ${it.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 shrink-0 text-xs">
                      ${(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              {inspectCart.status === 'ABANDONED' ? (
                <button
                  type="button"
                  onClick={() => handleMarkRecovered(inspectCart._id)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  Mark as Recovered
                </button>
              ) : (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Order Completed ({inspectCart.recoveredOrderId})
                </span>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectCart(null)}
                >
                  Close
                </Button>
                {inspectCart.status === 'ABANDONED' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendManualEmail(inspectCart._id, inspectCart.customerEmail)}
                    disabled={sendingEmailId === inspectCart._id}
                    leftIcon={<Mail className="w-3.5 h-3.5" />}
                  >
                    Send Recovery Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AbandonedCartsPage;
