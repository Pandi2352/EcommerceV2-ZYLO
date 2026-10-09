import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Radio,
  Send,
  Zap,
  Navigation,
} from 'lucide-react';
import { shippingDispatchService } from '../../services/shipping-dispatch.service';
import type {
  ShipmentDispatch,
  ReadyToShipOrder,
  CarrierRateOption,
  CarrierWebhookLog,
  ShippingMetrics,
  ShippingCarrier,
  ServiceLevel,
} from '../../services/shipping-dispatch.service';
import { warehousesService } from '../../services/warehouses.service';
import type { Warehouse } from '../../services/warehouses.service';
import { ROUTES } from '../../routes/routePaths';

export const ShippingDispatchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab driven by path or query
  const activeTab = useMemo<'ready' | 'manifests' | 'webhooks'>(() => {
    if (location.pathname.includes('/manifests')) return 'manifests';
    if (location.pathname.includes('/webhooks')) return 'webhooks';
    return 'ready';
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ShippingMetrics | null>(null);
  const [readyOrders, setReadyOrders] = useState<ReadyToShipOrder[]>([]);
  const [manifests, setManifests] = useState<ShipmentDispatch[]>([]);
  const [webhooks, setWebhooks] = useState<CarrierWebhookLog[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');

  // Modals & Active selections
  const [selectedOrder, setSelectedOrder] = useState<ReadyToShipOrder | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<ShipmentDispatch | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Rate shopping and dispatch form
  const [dispatchForm, setDispatchForm] = useState({
    originWarehouseId: '',
    packageWeightKg: 1.5,
    carrier: 'FEDEX' as ShippingCarrier,
    serviceLevel: 'EXPRESS_2DAY' as ServiceLevel,
    notes: 'Fragile electronics. Handle with extreme care.',
  });
  const [rates, setRates] = useState<CarrierRateOption[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Webhook simulate form
  const [webhookSimForm, setWebhookSimForm] = useState({
    trackingNumber: '',
    status: 'IN_TRANSIT',
    location: 'Regional Sorting Center, IL',
    message: 'Package scanned at automated sorting conveyor hub.',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, ro, mf, wh, whs] = await Promise.all([
        shippingDispatchService.getMetrics().catch(() => null),
        shippingDispatchService.getReadyToShipOrders().catch(() => []),
        shippingDispatchService.getManifests().catch(() => []),
        shippingDispatchService.getWebhooks().catch(() => []),
        warehousesService.getWarehouses().catch(() => []),
      ]);
      setMetrics(m);
      setReadyOrders(ro);
      setManifests(mf);
      setWebhooks(wh);
      setWarehouses(whs);

      if (whs.length > 0 && !dispatchForm.originWarehouseId) {
        setDispatchForm((prev) => ({ ...prev, originWarehouseId: whs[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load shipping data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Manifests
  const filteredManifests = useMemo(() => {
    return manifests.filter((m) => {
      const matchesSearch =
        m.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCarrier = carrierFilter === 'ALL' || m.carrier === carrierFilter;
      return matchesSearch && matchesCarrier;
    });
  }, [manifests, searchTerm, carrierFilter]);

  // Open Dispatch Modal for an Order
  const handleOpenDispatchModal = async (order: ReadyToShipOrder) => {
    setSelectedOrder(order);
    setIsDispatchModalOpen(true);
    setRatesLoading(true);
    try {
      const calculated = await shippingDispatchService.calculateRates({
        weightKg: dispatchForm.packageWeightKg,
      });
      setRates(calculated);
      if (calculated.length > 0) {
        setDispatchForm((prev) => ({
          ...prev,
          carrier: calculated[0].carrier,
          serviceLevel: calculated[0].serviceLevel,
        }));
      }
    } catch (err) {
      console.error('Failed to calculate rates:', err);
    } finally {
      setRatesLoading(false);
    }
  };

  // Re-calculate rates on weight change
  const handleWeightChange = async (newWeight: number) => {
    setDispatchForm((prev) => ({ ...prev, packageWeightKg: newWeight }));
    setRatesLoading(true);
    try {
      const calculated = await shippingDispatchService.calculateRates({
        weightKg: newWeight,
      });
      setRates(calculated);
    } catch (err) {
      console.error('Failed to calculate rates:', err);
    } finally {
      setRatesLoading(false);
    }
  };

  // Submit Dispatch & Generate Thermal Label
  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const created = await shippingDispatchService.createDispatch({
        orderId: selectedOrder._id,
        originWarehouseId: dispatchForm.originWarehouseId,
        carrier: dispatchForm.carrier,
        serviceLevel: dispatchForm.serviceLevel,
        packageWeightKg: dispatchForm.packageWeightKg,
        notes: dispatchForm.notes,
      });
      setIsDispatchModalOpen(false);
      setSelectedManifest(created);
      setIsLabelModalOpen(true);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to dispatch shipment');
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate Webhook Call
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await shippingDispatchService.simulateWebhook(webhookSimForm);
      setIsWebhookModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to dispatch simulated webhook');
    } finally {
      setActionLoading(false);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      MANIFEST_CREATED: {
        bg: 'bg-blue-50 dark:bg-blue-950/60',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200',
      },
      PICKED_UP: {
        bg: 'bg-purple-50 dark:bg-purple-950/60',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200',
      },
      IN_TRANSIT: {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200',
      },
      OUT_FOR_DELIVERY: {
        bg: 'bg-cyan-50 dark:bg-cyan-950/60',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200',
      },
      DELIVERED: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200',
      },
      EXCEPTION: {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200',
      },
    };
    const s = map[status] || map.MANIFEST_CREATED;
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${s.bg} ${s.text} ${s.border}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Shipping Dispatch & Courier Manifests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Multi-carrier rate shopping, 4x6" thermal barcode printing, and electronic EDI courier webhooks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (manifests.length > 0) {
                setWebhookSimForm((prev) => ({
                  ...prev,
                  trackingNumber: manifests[0].trackingNumber,
                }));
              }
              setIsWebhookModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 transition"
          >
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            Simulate Courier Webhook
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Ready to Pack & Ship</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.readyToShipCount || readyOrders.length} Orders
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">Pending Fulfillment</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Parcels In Transit</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.inTransitCount || 0}
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Active Linehauls</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Out For Delivery</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.outForDeliveryCount || 0}
            </h3>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 font-medium">Expected Today</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Successfully Delivered</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.deliveredCount || 0}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Signature Verified</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-8">
        <button
          onClick={() => navigate(ROUTES.SHIPPING_DISPATCH)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ready'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Ready to Ship ({readyOrders.length})
        </button>

        <button
          onClick={() => navigate(ROUTES.DISPATCH_MANIFESTS)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'manifests'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          Outbound Manifests & Labels ({manifests.length})
        </button>

        <button
          onClick={() => navigate(ROUTES.COURIER_WEBHOOKS)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'webhooks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          Carrier Webhook Logs ({webhooks.length})
        </button>
      </div>

      {/* TAB 1: READY TO SHIP ORDERS */}
      {activeTab === 'ready' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Orders Awaiting Packaging & Courier Label</h3>
            <span className="text-xs text-slate-400">Click "Rate Shop & Dispatch" to compare courier pricing & print label</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Order Number</th>
                  <th className="px-5 py-3.5">Customer & Destination</th>
                  <th className="px-5 py-3.5">Ordered Items</th>
                  <th className="px-5 py-3.5">Grand Total</th>
                  <th className="px-5 py-3.5">Order Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {readyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      All customer orders have been dispatched! No pending shipments in queue.
                    </td>
                  </tr>
                ) : (
                  readyOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {ord.orderNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{ord.customerName}</div>
                        <div className="text-xs text-slate-400">
                          {ord.shippingAddress?.city}, {ord.shippingAddress?.state} ({ord.shippingAddress?.country})
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-800 dark:text-slate-200">
                          {ord.items?.length || 1} Products
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {ord.items?.map((i) => i.name).join(', ') || 'Standard Merchandise'}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        ${ord.grandTotal?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                          {ord.orderStatus || 'CONFIRMED'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenDispatchModal(ord)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5 ml-auto"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Rate Shop & Dispatch
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OUTBOUND MANIFESTS & LABELS */}
      {activeTab === 'manifests' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracking, order #, or customer..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 dark:text-white"
              >
                <option value="ALL">All Carriers</option>
                <option value="FEDEX">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="DHL">DHL Express</option>
                <option value="USPS">USPS Priority</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Shipment #</th>
                  <th className="px-5 py-3.5">Carrier / Service</th>
                  <th className="px-5 py-3.5">Tracking Number</th>
                  <th className="px-5 py-3.5">Order / Customer</th>
                  <th className="px-5 py-3.5">Origin Warehouse</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredManifests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No outbound manifests found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredManifests.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {m.shipmentNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                              m.carrier === 'FEDEX'
                                ? 'bg-purple-600'
                                : m.carrier === 'UPS'
                                ? 'bg-amber-700'
                                : m.carrier === 'DHL'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-blue-600'
                            }`}
                          >
                            {m.carrier}
                          </span>
                          <span className="text-xs">{m.serviceLevel.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">${m.shippingCost.toFixed(2)} • {m.packageWeightKg} kg</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {m.trackingNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{m.customerName}</div>
                        <div className="text-xs text-slate-400">Order: {m.orderNumber}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">
                        {m.originWarehouseName}
                      </td>
                      <td className="px-5 py-4">{renderStatusBadge(m.status)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedManifest(m);
                              setIsLabelModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                            title="Print 4x6 Thermal Label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Thermal Label
                          </button>
                          <button
                            onClick={() => {
                              setSelectedManifest(m);
                              setIsTrackingModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition flex items-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Live Trail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CARRIER WEBHOOK LOGS */}
      {activeTab === 'webhooks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbound Electronic Data Interchange (EDI) Webhooks</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated push updates from FedEx Ground, UPS TrackAPI, and DHL Express gateways</p>
            </div>
            <button
              onClick={() => setIsWebhookModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Simulate Inbound Event
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Carrier</th>
                  <th className="px-5 py-3.5">Tracking Number</th>
                  <th className="px-5 py-3.5">Event Milestone</th>
                  <th className="px-5 py-3.5">Scan Location</th>
                  <th className="px-5 py-3.5">Received At</th>
                  <th className="px-5 py-3.5">Payload Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No webhook deliveries logged yet.
                    </td>
                  </tr>
                ) : (
                  webhooks.map((wh) => (
                    <tr key={wh._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{wh.carrier}</td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{wh.trackingNumber}</td>
                      <td className="px-5 py-4">{renderStatusBadge(wh.event)}</td>
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400">{wh.location}</td>
                      <td className="px-5 py-4 text-xs text-slate-500">{new Date(wh.receivedAt).toLocaleString()}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                        {JSON.stringify(wh.rawPayload)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPATCH & RATE SHOPPING MODAL */}
      {isDispatchModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Rate Shopping & Dispatch Manifest
                </h2>
                <p className="text-xs text-slate-500 font-mono">Order #{selectedOrder.orderNumber} • {selectedOrder.customerName}</p>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmDispatch} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Ship-From Warehouse Hub
                  </label>
                  <select
                    value={dispatchForm.originWarehouseId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, originWarehouseId: e.target.value })}
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh._id} value={wh._id}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Package Scaled Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={dispatchForm.packageWeightKg}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Multi-Carrier Live Rate Comparison */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">
                  Select Carrier & Service Level (Live Rate Shopping)
                </label>
                {ratesLoading ? (
                  <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    Calculating commercial discounted postage rates...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rates.map((rate, idx) => {
                      const isSelected =
                        dispatchForm.carrier === rate.carrier &&
                        dispatchForm.serviceLevel === rate.serviceLevel;
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setDispatchForm((prev) => ({
                              ...prev,
                              carrier: rate.carrier,
                              serviceLevel: rate.serviceLevel,
                            }))
                          }
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800/40'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                                  rate.carrier === 'FEDEX'
                                    ? 'bg-purple-600'
                                    : rate.carrier === 'UPS'
                                    ? 'bg-amber-700'
                                    : rate.carrier === 'DHL'
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-blue-600'
                                }`}
                              >
                                {rate.carrier}
                              </span>
                              <span>{rate.serviceName}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Est. {rate.estimatedDays} business days</p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900 dark:text-white">
                              ${rate.rate.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Courier Handling Notes & Special Instructions
                </label>
                <textarea
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                  rows={2}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  {actionLoading ? 'Creating Manifest...' : 'Generate 4x6 Label & Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4x6 THERMAL SHIPPING LABEL MODAL */}
      {isLabelModalOpen && selectedManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">4x6" Thermal Courier Label</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Label
                </button>
                <button
                  onClick={() => setIsLabelModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official 4x6 Thermal Label Rendering */}
            <div className="p-6 bg-white font-mono text-xs select-none">
              {/* Top Carrier Header */}
              <div className="border-4 border-black p-3 rounded flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">{selectedManifest.carrier}</h1>
                  <p className="text-[10px] font-bold">{selectedManifest.serviceLevel.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black border-2 border-black px-2 py-0.5">
                    {selectedManifest.routingCode}
                  </div>
                  <p className="text-[10px] mt-0.5 font-bold">{selectedManifest.packageWeightKg} KG</p>
                </div>
              </div>

              {/* Ship From & Ship To */}
              <div className="border-x-4 border-b-4 border-black p-3 space-y-3">
                <div className="text-[10px] text-slate-700">
                  <p className="font-bold text-black uppercase">SHIP FROM:</p>
                  <p className="font-semibold">ZYLO LOGISTICS FULFILLMENT CENTER</p>
                  <p>{selectedManifest.originWarehouseName}</p>
                </div>

                <div className="border-t-2 border-dashed border-black pt-2">
                  <p className="font-bold text-black uppercase text-[10px]">SHIP TO:</p>
                  <p className="font-black text-sm text-black">{selectedManifest.customerName}</p>
                  <p className="font-bold">{selectedManifest.shippingAddress?.street}</p>
                  <p className="font-black text-sm uppercase">
                    {selectedManifest.shippingAddress?.city}, {selectedManifest.shippingAddress?.state}{' '}
                    {selectedManifest.shippingAddress?.postalCode}
                  </p>
                  <p className="font-bold">{selectedManifest.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Large Barcode Representation */}
              <div className="border-x-4 border-b-4 border-black p-4 text-center">
                <div className="flex justify-center items-center py-4 bg-slate-50 border border-slate-300 rounded tracking-widest font-mono text-xl font-black">
                  ||| | ||||| || |||||| | ||||| |||| | ||| ||||
                </div>
                <p className="text-xs font-black tracking-widest mt-2">{selectedManifest.trackingNumber}</p>
                <p className="text-[10px] text-slate-500 mt-1">Ref: {selectedManifest.orderNumber}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE TRACKING MILESTONES MODAL */}
      {isTrackingModalOpen && selectedManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-600" />
                  Live Electronic Parcel Tracking
                </h2>
                <p className="text-xs text-slate-500 font-mono">{selectedManifest.carrier} • {selectedManifest.trackingNumber}</p>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Current State</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedManifest.status.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>{renderStatusBadge(selectedManifest.status)}</div>
              </div>

              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {selectedManifest.trackingHistory?.map((step, idx) => (
                  <div key={idx} className="relative pl-8 space-y-0.5">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 ring-2 ring-indigo-200" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{step.status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">{new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{step.location}</p>
                    <p className="text-[11px] text-slate-400">{step.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE CARRIER WEBHOOK MODAL */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-500" />
                Simulate EDI Courier Webhook Trigger
              </h2>
              <button
                onClick={() => setIsWebhookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSimulateWebhook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Select Parcel Tracking Number
                </label>
                <select
                  value={webhookSimForm.trackingNumber}
                  onChange={(e) => setWebhookSimForm({ ...webhookSimForm, trackingNumber: e.target.value })}
                  required
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white font-mono"
                >
                  <option value="">-- Choose Dispatched Parcel --</option>
                  {manifests.map((m) => (
                    <option key={m._id} value={m.trackingNumber}>
                      {m.trackingNumber} ({m.carrier} - {m.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Simulated Event Status
                </label>
                <select
                  value={webhookSimForm.status}
                  onChange={(e) => setWebhookSimForm({ ...webhookSimForm, status: e.target.value })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                >
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED (Sets Order to Delivered)</option>
                  <option value="EXCEPTION">EXCEPTION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Scan Location
                </label>
                <input
                  type="text"
                  value={webhookSimForm.location}
                  onChange={(e) => setWebhookSimForm({ ...webhookSimForm, location: e.target.value })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Courier Scanned Message
                </label>
                <input
                  type="text"
                  value={webhookSimForm.message}
                  onChange={(e) => setWebhookSimForm({ ...webhookSimForm, message: e.target.value })}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Dispatching...' : 'Fire Webhook Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShippingDispatchPage;
