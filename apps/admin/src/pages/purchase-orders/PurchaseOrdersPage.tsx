import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  User,
  Printer,
  PackageOpen,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  X,
  FileCheck,
} from 'lucide-react';
import { purchaseOrdersService } from '../../services/purchase-orders.service';
import type {
  Supplier,
  PurchaseOrder,
  ReceivingDockReceipt,
  POMetrics,
  POStatus,
} from '../../services/purchase-orders.service';
import { warehousesService } from '../../services/warehouses.service';
import type { Warehouse } from '../../services/warehouses.service';
import { ROUTES } from '../../routes/routePaths';

export const PurchaseOrdersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab state driven by route or local state
  const activeTab = useMemo<'pos' | 'suppliers' | 'dock'>(() => {
    if (location.pathname.includes('/suppliers')) return 'suppliers';
    if (location.pathname.includes('/receiving-dock')) return 'dock';
    return 'pos';
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<POMetrics | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dockReceipts, setDockReceipts] = useState<ReceivingDockReceipt[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isCreateSupplierOpen, setIsCreateSupplierOpen] = useState(false);
  const [isReceiveDockOpen, setIsReceiveDockOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form states
  const [poForm, setPoForm] = useState({
    supplierId: '',
    destinationWarehouseId: '',
    shippingCost: 250,
    taxAmount: 400,
    expectedDeliveryDate: '',
    notes: '',
    items: [
      {
        productId: 'prod-01',
        sku: 'SKU-CORE-101',
        name: 'Industrial Microcontroller Hub',
        orderedQty: 100,
        unitCost: 45.0,
      },
    ],
  });

  const [supplierForm, setSupplierForm] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    leadTimeDays: 7,
    paymentTerms: 'NET_30' as any,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    notes: '',
  });

  const [dockForm, setDockForm] = useState<{
    poId: string;
    dockBay: string;
    inspectorName: string;
    notes: string;
    items: Array<{
      sku: string;
      name: string;
      deliveredQty: number;
      acceptedQty: number;
      rejectedQty: number;
      rejectionReason: string;
    }>;
  }>({
    poId: '',
    dockBay: 'Bay 1 - Inbound Freight',
    inspectorName: 'Lead Logistics Inspector',
    notes: 'TAMPER_SEALS_VERIFIED',
    items: [],
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, pos, sups, docks, whs] = await Promise.all([
        purchaseOrdersService.getMetrics().catch(() => null),
        purchaseOrdersService.getPurchaseOrders().catch(() => []),
        purchaseOrdersService.getSuppliers().catch(() => []),
        purchaseOrdersService.getDockReceipts().catch(() => []),
        warehousesService.getWarehouses().catch(() => []),
      ]);
      setMetrics(m);
      setPurchaseOrders(pos);
      setSuppliers(sups);
      setDockReceipts(docks);
      setWarehouses(whs);

      // Pre-select defaults
      if (sups.length > 0 && !poForm.supplierId) {
        setPoForm((prev) => ({ ...prev, supplierId: sups[0]._id }));
      }
      if (whs.length > 0 && !poForm.destinationWarehouseId) {
        setPoForm((prev) => ({ ...prev, destinationWarehouseId: whs[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching PO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered POs
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.destinationWarehouseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  // Filtered Dock Receipts
  const filteredDockReceipts = useMemo(() => {
    return dockReceipts.filter(
      (d) =>
        d.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dockReceipts, searchTerm]);

  // Handle PO Creation
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await purchaseOrdersService.createPurchaseOrder(poForm);
      setIsCreatePOOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create Purchase Order');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Supplier Creation
  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await purchaseOrdersService.createSupplier({
        code: supplierForm.code,
        name: supplierForm.name,
        contactPerson: supplierForm.contactPerson,
        email: supplierForm.email,
        phone: supplierForm.phone,
        leadTimeDays: Number(supplierForm.leadTimeDays),
        paymentTerms: supplierForm.paymentTerms,
        address: {
          street: supplierForm.street,
          city: supplierForm.city,
          state: supplierForm.state,
          postalCode: supplierForm.postalCode,
          country: supplierForm.country,
        },
        notes: supplierForm.notes,
      });
      setIsCreateSupplierOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create Supplier');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Receive Dock Modal for a specific PO
  const handleOpenReceiveModal = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDockForm({
      poId: po._id,
      dockBay: 'Bay 2 - Fast Inbound',
      inspectorName: 'Lead Logistics Inspector',
      notes: 'Dock check complete. Verified carton barcodes.',
      items: po.items.map((it) => {
        const remaining = Math.max(0, it.orderedQty - (it.receivedQty || 0));
        return {
          sku: it.sku,
          name: it.name,
          deliveredQty: remaining,
          acceptedQty: remaining,
          rejectedQty: 0,
          rejectionReason: '',
        };
      }),
    });
    setIsReceiveDockOpen(true);
  };

  // Submit Receiving Dock Inspection
  const handleSubmitReceiving = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await purchaseOrdersService.receiveDockShipment({
        poId: dockForm.poId,
        dockBay: dockForm.dockBay,
        inspectorName: dockForm.inspectorName,
        notes: dockForm.notes,
        items: dockForm.items,
        passedInspection: true,
      });
      setIsReceiveDockOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to log dock receiving');
    } finally {
      setActionLoading(false);
    }
  };

  // PO Status badge
  const renderStatusBadge = (status: POStatus) => {
    const styles: Record<POStatus, string> = {
      DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      ISSUED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
      PARTIALLY_RECEIVED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
      RECEIVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
      CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status] || styles.DRAFT}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Suppliers & Purchase Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            End-to-end procurement lifecycle, certified vendor network, and inbound warehouse dock receiving.
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
          {activeTab === 'pos' && (
            <button
              onClick={() => setIsCreatePOOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button
              onClick={() => setIsCreateSupplierOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add New Supplier
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total PO Spend</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              ${(metrics?.totalSpend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{metrics?.totalPOs || 0} Total Manifests</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Open PO Orders</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.openPOCount || 0}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Pending Delivery</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Dock Check Pending</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.pendingReceivingCount || 0}
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Inbound Shipments</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Certified Vendors</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {metrics?.activeSuppliers || 0}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">100% Active SLA</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-8">
        <button
          onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'pos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Purchase Orders
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
            {purchaseOrders.length}
          </span>
        </button>

        <button
          onClick={() => navigate(ROUTES.SUPPLIERS)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Suppliers Directory
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
            {suppliers.length}
          </span>
        </button>

        <button
          onClick={() => navigate(ROUTES.RECEIVING_DOCK)}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'dock'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          Receiving Dock Inspection
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
            {dockReceipts.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'pos' ? 'PO # or supplier...' : activeTab === 'suppliers' ? 'supplier code or name...' : 'receipt or dock...'}`}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        {activeTab === 'pos' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="ALL">All PO Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="PARTIALLY_RECEIVED">Partially Received</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'pos' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">PO Manifest #</th>
                  <th className="px-5 py-3.5">Supplier / Vendor</th>
                  <th className="px-5 py-3.5">Destination Hub</th>
                  <th className="px-5 py-3.5">Line Items</th>
                  <th className="px-5 py-3.5">Total Cost</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No Purchase Orders found. Click "Create Purchase Order" above to initiate procurement.
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => {
                    const totalQty = po.items.reduce((acc, it) => acc + it.orderedQty, 0);
                    const receivedQty = po.items.reduce((acc, it) => acc + (it.receivedQty || 0), 0);
                    return (
                      <tr key={po._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {po.poNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">{po.supplierName}</div>
                          <div className="text-xs text-slate-400">{po.supplierCode || 'CERTIFIED_VENDOR'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">{po.destinationWarehouseName}</div>
                          <div className="text-xs text-slate-400">{po.destinationWarehouseCode}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {po.items.length} SKUs ({receivedQty} / {totalQty} Units)
                          </div>
                          <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.round((receivedQty / (totalQty || 1)) * 100))}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                          ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4">{renderStatusBadge(po.status)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPO(po);
                                setIsPrintModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                              title="Print Formal PO"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              PO PDF
                            </button>
                            {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenReceiveModal(po)}
                                className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition flex items-center gap-1"
                              >
                                <PackageOpen className="w-3.5 h-3.5" />
                                Dock Receive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup._id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sup.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Rating {sup.rating} / 5.0
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{sup.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sup.notes || 'No notes provided'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {sup.address?.city}, {sup.address?.state} ({sup.address?.country})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500">
                  Lead Time: <strong className="text-slate-800 dark:text-slate-200">{sup.leadTimeDays} Days</strong>
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {sup.paymentTerms}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RECEIVING DOCK INSPECTION */}
      {activeTab === 'dock' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Dock Receipt #</th>
                  <th className="px-5 py-3.5">Linked PO #</th>
                  <th className="px-5 py-3.5">Dock Bay / Inspector</th>
                  <th className="px-5 py-3.5">Warehouse Hub</th>
                  <th className="px-5 py-3.5">Accepted Qty</th>
                  <th className="px-5 py-3.5">Inspection Status</th>
                  <th className="px-5 py-3.5">Received Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {filteredDockReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No inbound dock receipts logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredDockReceipts.map((d) => {
                    const totalAccepted = d.items.reduce((acc, it) => acc + it.acceptedQty, 0);
                    return (
                      <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {d.receiptNumber}
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {d.poNumber}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">{d.dockBay}</div>
                          <div className="text-xs text-slate-400">{d.inspectorName}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-800 dark:text-slate-200">{d.warehouseName}</td>
                        <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {totalAccepted} Units Verified
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Passed
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(d.receivedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {isCreatePOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Issue New Purchase Order Manifest
              </h2>
              <button
                onClick={() => setIsCreatePOOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePO} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Select Supplier
                  </label>
                  <select
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Destination Warehouse Hub
                  </label>
                  <select
                    value={poForm.destinationWarehouseId}
                    onChange={(e) => setPoForm({ ...poForm, destinationWarehouseId: e.target.value })}
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
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-2">
                  Procurement Line Items
                </label>
                <div className="space-y-3">
                  {poForm.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400">SKU Code</label>
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[index].sku = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 dark:text-white font-mono"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400">Product Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[index].name = e.target.value;
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 dark:text-white"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400">Qty</label>
                        <input
                          type="number"
                          value={item.orderedQty}
                          min={1}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[index].orderedQty = Number(e.target.value);
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 dark:text-white"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400">Unit Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          min={0}
                          onChange={(e) => {
                            const newItems = [...poForm.items];
                            newItems[index].unitCost = Number(e.target.value);
                            setPoForm({ ...poForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 dark:text-white"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPoForm({
                      ...poForm,
                      items: [
                        ...poForm.items,
                        {
                          productId: `prod-0${poForm.items.length + 1}`,
                          sku: `SKU-PART-${poForm.items.length + 101}`,
                          name: 'Custom Component Part',
                          orderedQty: 50,
                          unitCost: 20.0,
                        },
                      ],
                    })
                  }
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Line Item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Freight / Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    value={poForm.shippingCost}
                    onChange={(e) => setPoForm({ ...poForm, shippingCost: Number(e.target.value) })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Expected Dock Delivery Date
                  </label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Procurement Notes
                </label>
                <textarea
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  placeholder="e.g. Include Certificate of Analysis, tamper-evident tape required."
                  rows={2}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatePOOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Issuing...' : 'Issue Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPLIER MODAL */}
      {isCreateSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Register New Supplier Profile
              </h2>
              <button
                onClick={() => setIsCreateSupplierOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Supplier Code
                  </label>
                  <input
                    type="text"
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    placeholder="SUP-TECH-01"
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="Apex Dynamics Corp"
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    required
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Payment Terms
                  </label>
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value as any })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  >
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                    <option value="IMMEDIATE">Immediate COD</option>
                    <option value="ADVANCE_50">50% Advance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={supplierForm.leadTimeDays}
                    onChange={(e) => setSupplierForm({ ...supplierForm, leadTimeDays: Number(e.target.value) })}
                    min={1}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateSupplierOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVING DOCK MODAL */}
      {isReceiveDockOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageOpen className="w-5 h-5 text-indigo-600" />
                  Receiving Dock Goods Inspection
                </h2>
                <p className="text-xs text-slate-500 font-mono">PO: {selectedPO.poNumber} | Hub: {selectedPO.destinationWarehouseName}</p>
              </div>
              <button
                onClick={() => setIsReceiveDockOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReceiving} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Dock Bay Number
                  </label>
                  <input
                    type="text"
                    value={dockForm.dockBay}
                    onChange={(e) => setDockForm({ ...dockForm, dockBay: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                    Inspector Name
                  </label>
                  <input
                    type="text"
                    value={dockForm.inspectorName}
                    onChange={(e) => setDockForm({ ...dockForm, inspectorName: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Item checklist */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Verify & Inspect Delivered Units
                </label>
                {dockForm.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{item.name}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{item.sku}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400">Delivered Count</label>
                        <input
                          type="number"
                          value={item.deliveredQty}
                          min={0}
                          onChange={(e) => {
                            const newItems = [...dockForm.items];
                            newItems[idx].deliveredQty = Number(e.target.value);
                            setDockForm({ ...dockForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-emerald-600 font-semibold">Accepted (Bin into Stock)</label>
                        <input
                          type="number"
                          value={item.acceptedQty}
                          min={0}
                          onChange={(e) => {
                            const newItems = [...dockForm.items];
                            newItems[idx].acceptedQty = Number(e.target.value);
                            setDockForm({ ...dockForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded p-1.5 dark:text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-rose-500 font-semibold">Rejected (Damaged)</label>
                        <input
                          type="number"
                          value={item.rejectedQty}
                          min={0}
                          onChange={(e) => {
                            const newItems = [...dockForm.items];
                            newItems[idx].rejectedQty = Number(e.target.value);
                            setDockForm({ ...dockForm, items: newItems });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded p-1.5 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Confirming this dock receiving will automatically increment the inventory levels in{' '}
                  <strong>{selectedPO.destinationWarehouseName}</strong> and catalog total stock.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReceiveDockOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Logging...' : 'Confirm Dock Receiving'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE PURCHASE ORDER MODAL */}
      {isPrintModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">ZYLO ENTERPRISE</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Official Purchase Order Manifest</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-indigo-600">{selectedPO.poNumber}</div>
                  <div className="text-xs text-slate-500">Date: {new Date(selectedPO.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Vendor & Delivery Box */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Vendor / Supplier</p>
                  <p className="font-bold text-sm text-slate-900">{selectedPO.supplierName}</p>
                  <p className="text-slate-600 mt-1">Code: {selectedPO.supplierCode}</p>
                  <p className="text-slate-500 mt-2">Payment Terms: <strong>{selectedPO.paymentStatus}</strong></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Ship To Hub</p>
                  <p className="font-bold text-sm text-slate-900">{selectedPO.destinationWarehouseName}</p>
                  <p className="text-slate-600 mt-1">Facility: {selectedPO.destinationWarehouseCode}</p>
                  <p className="text-slate-500 mt-2">
                    Expected Arrival: {selectedPO.expectedDeliveryDate ? new Date(selectedPO.expectedDeliveryDate).toLocaleDateString() : 'Immediate Freight'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold uppercase text-slate-600">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Ordered Qty</th>
                    <th className="p-3 text-right">Unit Cost</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPO.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-mono font-semibold">{it.sku}</td>
                      <td className="p-3 font-medium">{it.name}</td>
                      <td className="p-3 text-right">{it.orderedQty}</td>
                      <td className="p-3 text-right">${it.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${it.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">${selectedPO.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freight & Handling:</span>
                    <span className="font-medium">${selectedPO.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">${selectedPO.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t">
                    <span>Total Amount:</span>
                    <span className="text-indigo-600">${selectedPO.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t flex items-center justify-between">
                <p className="text-xs text-slate-400">Authorized Signature: ____________________________</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    Print Document
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PurchaseOrdersPage;
