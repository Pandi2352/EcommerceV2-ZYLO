import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { formatPrice } from '@shared/utils/currency';
import { inventoryService } from '@shared/api/inventory.service';
import { settingsService } from '@shared/api/settings.service';
import type {
  AdminInventoryItem,
  InventorySummaryMetrics,
} from '@shared/types/inventory';

import InventoryMetricsCards from '../components/inventory/InventoryMetricsCards';
import AdjustStockModal from '../components/inventory/AdjustStockModal';

export const InventoryPage: React.FC = () => {
  const [metrics, setMetrics] = useState<InventorySummaryMetrics | null>(null);
  const [items, setItems] = useState<AdminInventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'stock_asc' | 'stock_desc' | 'name' | 'recent' | 'price_desc'>('stock_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<AdminInventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Currency settings
  useEffect(() => {
    settingsService
      .getPublicSettings()
      .then((settings) => {
        if (settings?.currencySymbol) {
          setCurrencySymbol(settings.currencySymbol);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Inventory Summary
  const fetchSummary = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const data = await inventoryService.getSummary();
      setMetrics(data);
    } catch {
      // ignore
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Fetch Inventory List
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryService.list({
        search: search.trim() || undefined,
        status: statusFilter,
        sortBy,
        page,
        limit,
      });

      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load inventory stock levels');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, page, limit]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenAdjust = (prod: AdminInventoryItem) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleStockUpdated = () => {
    fetchInventory();
    fetchSummary();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Inventory & Stock Control"
        description="Monitor real-time product stock, variant levels, reorder thresholds, and warehouse replenishment."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchInventory();
              fetchSummary();
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Top Metrics Cards */}
      <InventoryMetricsCards
        metrics={metrics}
        currencySymbol={currencySymbol}
        loading={metricsLoading}
      />

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 select-none">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
            {[
              { id: 'ALL', label: 'All Items', count: metrics?.totalProducts },
              { id: 'LOW_STOCK', label: 'Low Stock', count: metrics?.lowStockCount, isAlert: true },
              { id: 'OUT_OF_STOCK', label: 'Out of Stock', count: metrics?.outOfStockCount, isDanger: true },
              { id: 'IN_STOCK', label: 'In Stock', count: metrics?.inStockCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-sm text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : tab.isDanger
                        ? 'bg-rose-100 text-rose-700'
                        : tab.isAlert
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700 cursor-pointer font-medium"
            >
              <option value="stock_asc">Lowest Stock First (Urgent)</option>
              <option value="stock_desc">Highest Stock First</option>
              <option value="name">Product Name (A-Z)</option>
              <option value="price_desc">Highest Price</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Page Limit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product name, base SKU, or variant SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-indigo-500 text-slate-800 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-slate-500">
            <span>Showing {items.length} of {total} items</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading inventory records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No inventory records found</p>
                    <p className="text-xs text-slate-400">
                      Try clearing search queries or switching status tabs.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Product Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {prod.thumbnailUrl ? (
                            <img
                              src={prod.thumbnailUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[220px]">
                          <p className="font-semibold text-slate-900 truncate" title={prod.name}>
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku}
                            </span>
                            {prod.brand && (
                              <span className="text-[10px] text-indigo-600 font-medium">
                                · {prod.brand.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {prod.category?.name || 'Unassigned'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {formatPrice(prod.basePrice, { currencySymbol })}
                    </td>

                    {/* Available Units & Variant Breakdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {prod.stockQuantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">units</span>
                      </div>
                      {prod.variants && prod.variants.length > 0 && (
                        <div className="mt-1 flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                            {prod.variants.length} variant{prod.variants.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Low Stock Threshold */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                      &le; {prod.lowStockThreshold}
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prod.stockStatus === 'OUT_OF_STOCK' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                          <XCircle className="w-3 h-3" />
                          <span>Out of Stock</span>
                        </span>
                      ) : prod.stockStatus === 'LOW_STOCK' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock ({prod.stockQuantity} left)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>

                    {/* Valuation */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatPrice(prod.inventoryValuation, { currencySymbol })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAdjust(prod)}
                        className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      >
                        Adjust / Restock
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {page} of {totalPages} ({total} products)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Slide-over Modal */}
      <AdjustStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onStockUpdated={handleStockUpdated}
      />
    </div>
  );
};

export default InventoryPage;
