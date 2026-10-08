import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Truck,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  FileText,
  Boxes,
  Check,
  X,
  Layers,
  Edit2,
} from 'lucide-react';
import {
  FcHome,
  FcShipped,
  FcInspection,
  FcMultipleDevices,
} from 'react-icons/fc';
import {
  warehousesService,
  type Warehouse,
  type StockTransfer,
  type WarehouseInventoryItem,
  type WarehouseMetrics,
  type WarehouseType,
  type WarehouseStatus,
  type TransferStatus,
  type CreateWarehousePayload,
  type CreateStockTransferPayload,
  type ReceiveStockTransferPayload,
} from '../../services/warehouses.service';
import { toast } from '@shared/ui/Toast';
import { Button } from '@shared/ui/Button';

export const WarehousesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isTransfersPath = location.pathname.endsWith('/transfers') || searchParams.get('tab') === 'transfers';
  const initialTab = isTransfersPath ? 'transfers' : (searchParams.get('tab') === 'inventory' ? 'inventory' : 'warehouses');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'warehouses' | 'transfers' | 'inventory'>(initialTab);

  // Data States
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [metrics, setMetrics] = useState<WarehouseMetrics | null>(null);
  const [selectedWarehouseInventory, setSelectedWarehouseInventory] = useState<WarehouseInventoryItem[]>([]);
  const [inventoryWarehouseId, setInventoryWarehouseId] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [transferStatusFilter, setTransferStatusFilter] = useState<string>('ALL');

  // Modals
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState<boolean>(false);
  const [selectedTransferForReceive, setSelectedTransferForReceive] = useState<StockTransfer | null>(null);

  const [isManifestModalOpen, setIsManifestModalOpen] = useState<boolean>(false);
  const [selectedManifest, setSelectedManifest] = useState<StockTransfer | null>(null);

  // Warehouse Form State
  const [whCode, setWhCode] = useState('');
  const [whName, setWhName] = useState('');
  const [whType, setWhType] = useState<WarehouseType>('REGIONAL_HUB');
  const [whStatus, setWhStatus] = useState<WarehouseStatus>('ACTIVE');
  const [whIsDefault, setWhIsDefault] = useState(false);
  const [whStreet, setWhStreet] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('');
  const [whPostalCode, setWhPostalCode] = useState('');
  const [whCountry, setWhCountry] = useState('United States');
  const [whContactPerson, setWhContactPerson] = useState('');
  const [whContactEmail, setWhContactEmail] = useState('');
  const [whContactPhone, setWhContactPhone] = useState('');
  const [whCapacity, setWhCapacity] = useState(60000);
  const [whHours, setWhHours] = useState('Mon - Fri: 8:00 AM - 6:00 PM EST');
  const [whRegions, setWhRegions] = useState('');

  // Transfer Form State
  const [trfSourceId, setTrfSourceId] = useState('');
  const [trfDestId, setTrfDestId] = useState('');
  const [trfCarrier, setTrfCarrier] = useState('FedEx Freight');
  const [trfTracking, setTrfTracking] = useState('');
  const [trfEta, setTrfEta] = useState('');
  const [trfNotes, setTrfNotes] = useState('');
  const [trfItems, setTrfItems] = useState<Array<{ sku: string; productName: string; variantTitle: string; requestedQty: number }>>([
    { sku: 'MBP16-SG-32-1TB', productName: 'Apple MacBook Pro 16"', variantTitle: 'Space Gray, 32GB RAM', requestedQty: 25 },
  ]);

  // Receive Form State
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState('');

  // Initial Fetch
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [whList, trfList, mtr] = await Promise.all([
        warehousesService.getWarehouses(),
        warehousesService.getStockTransfers(),
        warehousesService.getMetrics(),
      ]);

      setWarehouses(whList);
      setTransfers(trfList);
      setMetrics(mtr);

      if (whList.length > 0 && !inventoryWarehouseId) {
        setInventoryWarehouseId(whList[0]._id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load warehouses data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname.endsWith('/transfers')) {
      setActiveTab('transfers');
      return;
    }
    const tab = searchParams.get('tab');
    if (tab === 'transfers') setActiveTab('transfers');
    else if (tab === 'inventory') setActiveTab('inventory');
    else if (!tab) setActiveTab('warehouses');
  }, [searchParams, location.pathname]);

  const handleTabChange = (tab: 'warehouses' | 'transfers' | 'inventory') => {
    setActiveTab(tab);
    setSearchParams(tab === 'warehouses' ? {} : { tab });
  };

  // Fetch Inventory for specific warehouse
  useEffect(() => {
    if (!inventoryWarehouseId || activeTab !== 'inventory') return;
    const fetchInv = async () => {
      try {
        const inv = await warehousesService.getWarehouseInventory(inventoryWarehouseId);
        setSelectedWarehouseInventory(inv);
      } catch (err: any) {
        toast.error('Failed to load inventory for selected hub');
      }
    };
    fetchInv();
  }, [inventoryWarehouseId, activeTab]);

  // Filtered Warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((wh) => {
      const matchesSearch =
        wh.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wh.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wh.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wh.address.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || wh.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || wh.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [warehouses, searchQuery, typeFilter, statusFilter]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch =
        t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sourceWarehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationWarehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.carrier && t.carrier.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.trackingNumber && t.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = transferStatusFilter === 'ALL' || t.status === transferStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchQuery, transferStatusFilter]);

  // Open Create/Edit Warehouse Modal
  const handleOpenWarehouseModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWarehouse(wh);
      setWhCode(wh.code);
      setWhName(wh.name);
      setWhType(wh.type);
      setWhStatus(wh.status);
      setWhIsDefault(wh.isDefault);
      setWhStreet(wh.address.street);
      setWhCity(wh.address.city);
      setWhState(wh.address.state);
      setWhPostalCode(wh.address.postalCode);
      setWhCountry(wh.address.country);
      setWhContactPerson(wh.contactPerson);
      setWhContactEmail(wh.contactEmail);
      setWhContactPhone(wh.contactPhone);
      setWhCapacity(wh.capacitySqFt);
      setWhHours(wh.operatingHours);
      setWhRegions(wh.servicedRegions ? wh.servicedRegions.join(', ') : '');
    } else {
      setEditingWarehouse(null);
      setWhCode('');
      setWhName('');
      setWhType('REGIONAL_HUB');
      setWhStatus('ACTIVE');
      setWhIsDefault(false);
      setWhStreet('');
      setWhCity('');
      setWhState('');
      setWhPostalCode('');
      setWhCountry('United States');
      setWhContactPerson('');
      setWhContactEmail('');
      setWhContactPhone('');
      setWhCapacity(60000);
      setWhHours('Mon - Fri: 8:00 AM - 6:00 PM EST');
      setWhRegions('');
    }
    setIsWarehouseModalOpen(true);
  };

  // Submit Warehouse Form
  const handleSaveWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whCode.trim() || !whName.trim()) {
      toast.error('Warehouse code and name are required');
      return;
    }

    const payload: CreateWarehousePayload = {
      code: whCode.trim().toUpperCase(),
      name: whName.trim(),
      type: whType,
      status: whStatus,
      isDefault: whIsDefault,
      address: {
        street: whStreet.trim(),
        city: whCity.trim(),
        state: whState.trim(),
        postalCode: whPostalCode.trim(),
        country: whCountry.trim(),
      },
      contactPerson: whContactPerson.trim(),
      contactEmail: whContactEmail.trim(),
      contactPhone: whContactPhone.trim(),
      capacitySqFt: Number(whCapacity) || 50000,
      operatingHours: whHours.trim(),
      servicedRegions: whRegions
        ? whRegions.split(',').map((r) => r.trim()).filter(Boolean)
        : [],
    };

    try {
      setIsSubmitting(true);
      if (editingWarehouse) {
        await warehousesService.updateWarehouse(editingWarehouse._id, payload);
        toast.success(`Warehouse "${whName}" updated successfully`);
      } else {
        await warehousesService.createWarehouse(payload);
        toast.success(`Fulfillment center "${whName}" created successfully`);
      }
      setIsWarehouseModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Warehouse Status
  const handleToggleStatus = async (wh: Warehouse) => {
    const nextStatus = wh.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      await warehousesService.toggleStatus(wh._id, nextStatus);
      toast.success(`Warehouse status updated to ${nextStatus}`);
      setWarehouses((prev) =>
        prev.map((item) => (item._id === wh._id ? { ...item, status: nextStatus } : item))
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update warehouse status');
    }
  };

  // Open Create Transfer Modal
  const handleOpenTransferModal = () => {
    if (warehouses.length < 2) {
      toast.error('You need at least two warehouses to create a stock transfer.');
      return;
    }
    setTrfSourceId(warehouses[0]._id);
    setTrfDestId(warehouses[1]._id);
    setTrfCarrier('FedEx Freight');
    setTrfTracking('');
    setTrfEta('');
    setTrfNotes('');
    setTrfItems([
      { sku: 'MBP16-SG-32-1TB', productName: 'Apple MacBook Pro 16"', variantTitle: 'Space Gray, 32GB RAM', requestedQty: 25 },
    ]);
    setIsTransferModalOpen(true);
  };

  // Add Item to Transfer
  const handleAddTransferItem = () => {
    setTrfItems((prev) => [
      ...prev,
      { sku: '', productName: '', variantTitle: '', requestedQty: 10 },
    ]);
  };

  // Remove Item from Transfer
  const handleRemoveTransferItem = (idx: number) => {
    setTrfItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Create Transfer
  const handleSaveTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trfSourceId === trfDestId) {
      toast.error('Source and destination warehouses cannot be the same');
      return;
    }
    if (trfItems.some((i) => !i.sku.trim() || !i.productName.trim() || i.requestedQty <= 0)) {
      toast.error('Please fill all item SKUs, product names, and positive quantities');
      return;
    }

    const payload: CreateStockTransferPayload = {
      sourceWarehouseId: trfSourceId,
      destinationWarehouseId: trfDestId,
      items: trfItems.map((i) => ({
        sku: i.sku.trim().toUpperCase(),
        productName: i.productName.trim(),
        variantTitle: i.variantTitle.trim(),
        requestedQty: Number(i.requestedQty),
      })),
      carrier: trfCarrier.trim(),
      trackingNumber: trfTracking.trim(),
      estimatedArrival: trfEta ? trfEta : undefined,
      notes: trfNotes.trim(),
    };

    try {
      setIsSubmitting(true);
      await warehousesService.createStockTransfer(payload);
      toast.success('Stock transfer manifest created successfully');
      setIsTransferModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create stock transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dispatch Transfer to IN_TRANSIT
  const handleDispatchTransfer = async (transfer: StockTransfer) => {
    if (!window.confirm(`Confirm dispatch of manifest ${transfer.transferNumber}? Status will become IN_TRANSIT.`)) return;
    try {
      await warehousesService.updateTransferStatus(transfer._id, 'IN_TRANSIT');
      toast.success(`Manifest ${transfer.transferNumber} marked as IN_TRANSIT`);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch transfer');
    }
  };

  // Open Receive Modal
  const handleOpenReceiveModal = (transfer: StockTransfer) => {
    setSelectedTransferForReceive(transfer);
    const initialQtys: Record<string, number> = {};
    transfer.items.forEach((item) => {
      initialQtys[item.sku] = item.shippedQty > 0 ? item.shippedQty : item.requestedQty;
    });
    setReceiveQuantities(initialQtys);
    setReceiveNotes('');
    setIsReceiveModalOpen(true);
  };

  // Submit Receive Transfer
  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransferForReceive) return;

    const payload: ReceiveStockTransferPayload = {
      receivedItems: selectedTransferForReceive.items.map((item) => ({
        sku: item.sku,
        receivedQty: Number(receiveQuantities[item.sku] ?? item.requestedQty),
      })),
      notes: receiveNotes.trim(),
    };

    try {
      setIsSubmitting(true);
      await warehousesService.receiveStockTransfer(selectedTransferForReceive._id, payload);
      toast.success(`Items received into ${selectedTransferForReceive.destinationWarehouseName} inventory!`);
      setIsReceiveModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to receive stock transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for Status Badges
  const getTransferStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            In Transit
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Approval
          </span>
        );
      case 'PARTIALLY_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Partially Received
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-5 p-6">
      {/* ─── 1. PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Fulfillment &amp; Supply Chain Logistics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Warehouses &amp; Fulfillment Hubs
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Multi-Facility
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage regional distribution centers, monitor inventory buffers, and coordinate inter-warehouse stock transfer manifests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTransferModal}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            New Transfer
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenWarehouseModal()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* ─── 2. TOP KPI METRICS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warehouses */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
            <FcHome className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Warehouses
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics?.totalWarehouses ?? warehouses.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Facilities</span>
            </div>
          </div>
        </div>

        {/* Active Hubs */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-emerald-50/50 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <FcInspection className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Hubs
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">
                {metrics?.activeWarehouses ?? warehouses.filter((w) => w.status === 'ACTIVE').length}
              </span>
              <span className="text-xs text-emerald-600/80 font-medium">100% Operational</span>
            </div>
          </div>
        </div>

        {/* In-Transit Transfers */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-blue-50/50 flex items-center justify-center shrink-0 border border-blue-100/60">
            <FcShipped className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              In-Transit Transfers
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-blue-600 tracking-tight">
                {metrics?.inTransitTransfers ?? transfers.filter((t) => t.status === 'IN_TRANSIT').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Active En Route</span>
            </div>
          </div>
        </div>

        {/* Total Units Stocked */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-center gap-3.5 shadow-none">
          <div className="w-12 h-12 rounded-md bg-purple-50/50 flex items-center justify-center shrink-0 border border-purple-100/60">
            <FcMultipleDevices className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Stocked Units
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {metrics?.totalUnitsStocked
                  ? metrics.totalUnitsStocked.toLocaleString()
                  : '136,000'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Units Across Hubs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. TAB CONTROLS ────────────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('warehouses')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all ${
            activeTab === 'warehouses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Fulfillment Centers
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-normal">
            {warehouses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('transfers')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all ${
            activeTab === 'transfers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Stock Transfers &amp; Manifests
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-normal">
            {transfers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('inventory')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Warehouse Stock Ledger
        </button>
      </div>

      {/* ─── TAB 1: FULFILLMENT CENTERS ─────────────────────────────────────────── */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by facility name, code, city, country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none"
              >
                <option value="ALL">All Hub Types</option>
                <option value="PRIMARY_DISTRIBUTION">Primary Distribution</option>
                <option value="REGIONAL_HUB">Regional Hub</option>
                <option value="LOCAL_STORE">Local Store</option>
                <option value="RETURN_CENTER">Return Center</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Warehouses Grid */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Loading fulfillment centers...
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Warehouses Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWarehouses.map((wh) => (
                <div
                  key={wh._id}
                  className="bg-white border border-slate-200 rounded-md p-5 shadow-none flex flex-col justify-between hover:border-indigo-300 transition-colors"
                >
                  <div>
                    {/* Header: Code, Badges, Status toggle */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {wh.code}
                        </span>
                        {wh.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ★ Primary Default
                          </span>
                        )}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {wh.type.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Status Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(wh)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          wh.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {wh.status}
                      </button>
                    </div>

                    {/* Warehouse Name */}
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {wh.name}
                    </h3>

                    {/* Address */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {wh.address.street}, {wh.address.city}, {wh.address.state} {wh.address.postalCode}, {wh.address.country}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{wh.contactEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wh.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{wh.operatingHours}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wh.capacitySqFt.toLocaleString()} sq ft</span>
                      </div>
                    </div>

                    {/* Serviced Regions */}
                    {wh.servicedRegions && wh.servicedRegions.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">Regions:</span>
                        {wh.servicedRegions.map((region) => (
                          <span
                            key={region}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Stock summary & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Total Stock</span>
                      <p className="text-sm font-bold text-slate-900">
                        {wh.totalInventoryUnits > 0
                          ? wh.totalInventoryUnits.toLocaleString()
                          : 'Available'} units
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInventoryWarehouseId(wh._id);
                          handleTabChange('inventory');
                        }}
                        className="text-xs"
                      >
                        <Boxes className="w-3.5 h-3.5 mr-1" />
                        View Stock
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenWarehouseModal(wh)}
                        className="text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: STOCK TRANSFERS ─────────────────────────────────────────────── */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="bg-white border border-slate-200 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by manifest #, warehouse, carrier, tracking #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={transferStatusFilter}
                onChange={(e) => setTransferStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none"
              >
                <option value="ALL">All Manifest Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenTransferModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Transfer
              </Button>
            </div>
          </div>

          {/* Transfers Table */}
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
              Loading stock transfers...
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Stock Transfers Found</h3>
              <p className="text-xs text-slate-500 mt-1">Initiate a transfer between your regional hubs above.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Transfer Manifest #</th>
                      <th className="py-3 px-4">Route (Origin ➔ Destination)</th>
                      <th className="py-3 px-4 text-center">SKU Items / Total Qty</th>
                      <th className="py-3 px-4">Carrier &amp; Tracking</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransfers.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Transfer # */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {t.transferNumber}
                        </td>

                        {/* Origin ➔ Destination */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-800">{t.sourceWarehouseName}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-800">{t.destinationWarehouseName}</span>
                          </div>
                          {t.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{t.notes}</p>
                          )}
                        </td>

                        {/* Items / Quantity */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-800">{t.totalItemsCount} SKUs</span>
                          <span className="text-slate-400 block text-[11px]">
                            {t.totalQuantity} total units
                          </span>
                        </td>

                        {/* Carrier & Tracking */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-medium">{t.carrier || 'Standard Freight'}</div>
                          {t.trackingNumber ? (
                            <span className="font-mono text-[11px] text-indigo-600">
                              {t.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No AWB assigned</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {getTransferStatusBadge(t.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Manifest Details */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedManifest(t);
                                setIsManifestModalOpen(true);
                              }}
                              className="text-[11px] h-7 px-2"
                              title="View Items Manifest"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Manifest
                            </Button>

                            {/* Dispatch Action */}
                            {t.status === 'PENDING_APPROVAL' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleDispatchTransfer(t)}
                                className="text-[11px] h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                              >
                                <Truck className="w-3 h-3 mr-1" />
                                Dispatch
                              </Button>
                            )}

                            {/* Receive Action */}
                            {t.status === 'IN_TRANSIT' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenReceiveModal(t)}
                                className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Receive Items
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: WAREHOUSE STOCK LEDGER ─────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Facility Selector */}
          <div className="bg-white border border-slate-200 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-3">
              <label htmlFor="wh-inventory-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                Select Facility:
              </label>
              <select
                id="wh-inventory-select"
                value={inventoryWarehouseId}
                onChange={(e) => setInventoryWarehouseId(e.target.value)}
                className="h-8 px-3 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.code} - {wh.name} ({wh.address.city}, {wh.address.country})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing active SKUs currently stocked in this distribution hub
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product Name &amp; Variant</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-center">Reserved Units</th>
                    <th className="py-3 px-4 text-center">Safety Buffer</th>
                    <th className="py-3 px-4">Bin Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedWarehouseInventory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No inventory records found for this warehouse.
                      </td>
                    </tr>
                  ) : (
                    selectedWarehouseInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {item.sku}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{item.productName}</p>
                          {item.variantTitle && (
                            <span className="text-[11px] text-slate-500">{item.variantTitle}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                          {item.quantity.toLocaleString()} units
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {item.reservedQuantity} units
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-600 font-medium">
                          {item.safetyStock} units
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {item.binLocation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT WAREHOUSE ────────────────────────────────────── */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingWarehouse ? 'Edit Fulfillment Center' : 'Add New Fulfillment Center'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWarehouseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Code * (e.g. WH-US-EAST)
                  </label>
                  <input
                    type="text"
                    required
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    placeholder="WH-001"
                    className="w-full font-mono uppercase px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="US East Logistics Hub"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Warehouse Type
                  </label>
                  <select
                    value={whType}
                    onChange={(e) => setWhType(e.target.value as WarehouseType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PRIMARY_DISTRIBUTION">Primary Distribution Center</option>
                    <option value="REGIONAL_HUB">Regional Logistics Hub</option>
                    <option value="LOCAL_STORE">Local Retail Store</option>
                    <option value="RETURN_CENTER">Dedicated Return Center</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating Status
                  </label>
                  <select
                    value={whStatus}
                    onChange={(e) => setWhStatus(e.target.value as WarehouseStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Active (Operational)</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="wh-default"
                  checked={whIsDefault}
                  onChange={(e) => setWhIsDefault(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="wh-default" className="font-semibold text-slate-700 cursor-pointer">
                  Set as Primary Default Warehouse for Online Orders
                </label>
              </div>

              {/* Address Fields */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Facility Physical Address</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={whStreet}
                    onChange={(e) => setWhStreet(e.target.value)}
                    placeholder="Street Address (e.g. 100 Distribution Blvd)"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      value={whCity}
                      onChange={(e) => setWhCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={whState}
                      onChange={(e) => setWhState(e.target.value)}
                      placeholder="State / Province"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={whPostalCode}
                      onChange={(e) => setWhPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={whCountry}
                      onChange={(e) => setWhCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 mb-2">Facility Management Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={whContactPerson}
                    onChange={(e) => setWhContactPerson(e.target.value)}
                    placeholder="Manager Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={whContactEmail}
                    onChange={(e) => setWhContactEmail(e.target.value)}
                    placeholder="Manager Email"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={whContactPhone}
                    onChange={(e) => setWhContactPhone(e.target.value)}
                    placeholder="Direct Phone"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Capacity, Hours, Serviced Regions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capacity (Sq Ft)
                  </label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={whHours}
                    onChange={(e) => setWhHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Serviced Regions (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={whRegions}
                    onChange={(e) => setWhRegions(e.target.value)}
                    placeholder="NY, NJ, PA, CT"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWarehouseModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
                >
                  {isSubmitting ? 'Saving...' : editingWarehouse ? 'Update Facility' : 'Create Facility'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE STOCK TRANSFER ──────────────────────────────────────── */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  New Inter-Warehouse Stock Transfer Manifest
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Origin Warehouse (Source) *
                  </label>
                  <select
                    required
                    value={trfSourceId}
                    onChange={(e) => setTrfSourceId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh._id} value={wh._id} disabled={wh._id === trfDestId}>
                        {wh.code} - {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination Warehouse *
                  </label>
                  <select
                    required
                    value={trfDestId}
                    onChange={(e) => setTrfDestId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {warehouses.map((wh) => (
                      <option key={wh._id} value={wh._id} disabled={wh._id === trfSourceId}>
                        {wh.code} - {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Logistics Carrier
                  </label>
                  <input
                    type="text"
                    value={trfCarrier}
                    onChange={(e) => setTrfCarrier(e.target.value)}
                    placeholder="FedEx National Freight"
                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trfTracking}
                    onChange={(e) => setTrfTracking(e.target.value)}
                    placeholder="FDX-8829104"
                    className="w-full font-mono px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line items table */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800">Transfer Line Items</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTransferItem}
                    className="text-[11px] h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {trfItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                      <input
                        type="text"
                        required
                        placeholder="SKU"
                        value={item.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrfItems((prev) =>
                            prev.map((i, iIdx) => (iIdx === idx ? { ...i, sku: val } : i))
                          );
                        }}
                        className="w-32 font-mono uppercase px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Product Name"
                        value={item.productName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrfItems((prev) =>
                            prev.map((i, iIdx) => (iIdx === idx ? { ...i, productName: val } : i))
                          );
                        }}
                        className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="Qty"
                        value={item.requestedQty}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTrfItems((prev) =>
                            prev.map((i, iIdx) => (iIdx === idx ? { ...i, requestedQty: val } : i))
                          );
                        }}
                        className="w-20 px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                      {trfItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTransferItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transfer Notes &amp; Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={trfNotes}
                  onChange={(e) => setTrfNotes(e.target.value)}
                  placeholder="Reason for transfer, handling instructions, pallet counts..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransferModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
                >
                  {isSubmitting ? 'Creating Manifest...' : 'Create Manifest'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECEIVE STOCK TRANSFER ─────────────────────────────────────── */}
      {isReceiveModalOpen && selectedTransferForReceive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Receive Items into {selectedTransferForReceive.destinationWarehouseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReceive} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-semibold text-slate-800">
                  Manifest: <span className="font-mono text-indigo-600">{selectedTransferForReceive.transferNumber}</span>
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Origin: {selectedTransferForReceive.sourceWarehouseName}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Verify Received Physical Quantities</h4>
                <div className="space-y-2">
                  {selectedTransferForReceive.items.map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="font-mono text-[11px] text-slate-400">{item.sku}</p>
                        <span className="text-[10px] text-blue-600 font-medium">
                          Shipped: {item.shippedQty || item.requestedQty} units
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-slate-600">Received:</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={receiveQuantities[item.sku] ?? item.requestedQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setReceiveQuantities((prev) => ({ ...prev, [item.sku]: val }));
                          }}
                          className="w-20 px-2 py-1 text-center font-bold border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Receiving Inspection Notes (e.g. Pallet condition, damaged units)
                </label>
                <textarea
                  rows={2}
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  placeholder="All packages verified undamaged..."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReceiveModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                >
                  {isSubmitting ? 'Receiving...' : 'Confirm Receipt & Complete'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW MANIFEST BREAKDOWN ────────────────────────────────────── */}
      {isManifestModalOpen && selectedManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Manifest #{selectedManifest.transferNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Origin</span>
                  <p className="font-bold text-slate-900">{selectedManifest.sourceWarehouseName}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Destination</span>
                  <p className="font-bold text-slate-900">{selectedManifest.destinationWarehouseName}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Carrier / AWB</span>
                  <p className="font-medium text-slate-700">
                    {selectedManifest.carrier || 'N/A'} - {selectedManifest.trackingNumber || 'No tracking'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Status</span>
                  <div className="mt-0.5">{getTransferStatusBadge(selectedManifest.status)}</div>
                </div>
              </div>

              {selectedManifest.notes && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded text-amber-900">
                  <span className="font-bold">Notes:</span> {selectedManifest.notes}
                </div>
              )}

              <h4 className="font-bold text-slate-800 pt-2">Manifest Items</h4>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 text-center">Requested</th>
                      <th className="py-2.5 px-3 text-center">Shipped</th>
                      <th className="py-2.5 px-3 text-center">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedManifest.items.map((item) => (
                      <tr key={item.sku}>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.sku}</td>
                        <td className="py-2.5 px-3">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center">{item.requestedQty}</td>
                        <td className="py-2.5 px-3 text-center">{item.shippedQty}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{item.receivedQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManifestModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
