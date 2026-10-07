import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import type { AdminCustomerItem, AdminCustomerStats } from '@shared/types/customer';
import { customersService } from '@shared/api/customers.service';
import { settingsService } from '@shared/api/settings.service';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { formatPrice } from '@shared/utils/currency';
import { CustomerMetricsCards } from '../components/customers/CustomerMetricsCards';
import { CustomerDetailsDrawer } from '../components/customers/CustomerDetailsDrawer';

export const CustomersPage: React.FC = () => {
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [stats, setStats] = useState<AdminCustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'spend' | 'orders' | 'name'>('recent');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await customersService.getStats();
      setStats(res);
    } catch {
      // ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customersService.list({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy,
        page,
        limit,
      });

      setCustomers(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, page, limit]);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleStatus = async (customer: AdminCustomerItem) => {
    try {
      setUpdatingId(customer._id);
      await customersService.toggleStatus(customer._id, !customer.isActive);
      toast.success(
        `Customer "${customer.name}" account is now ${!customer.isActive ? 'Active' : 'Suspended'}`,
      );
      fetchCustomers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update customer status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blobData = await customersService.export('csv');
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers-directory-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Customer directory exported successfully');
    } catch {
      toast.error('Failed to export customers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Customer Directory & Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor registered customers, track lifetime spend, review orders, and manage account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              fetchCustomers();
              fetchStats();
            }}
            disabled={loading}
            className="text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            isLoading={exporting}
            className="text-slate-700"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <CustomerMetricsCards
        stats={stats}
        loading={statsLoading}
        currencySymbol={currencySymbol}
      />

      {/* Control Panel / Filter bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'ALL', label: 'All Customers', count: stats?.totalCustomers },
            { id: 'ACTIVE', label: 'Active', count: stats?.activeCustomers },
            { id: 'SUSPENDED', label: 'Suspended', count: stats?.suspendedCustomers, highlight: (stats?.suspendedCustomers || 0) > 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    tab.highlight
                      ? 'bg-rose-100 text-rose-800 font-bold'
                      : statusFilter === tab.id
                      ? 'bg-indigo-200/60 text-indigo-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Sort Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="recent">Recently Registered</option>
              <option value="spend">Highest Spend</option>
              <option value="orders">Most Orders</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Saved Addresses</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span>Loading customers directory...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">No customers found</p>
                      <p className="text-xs text-slate-400">
                        Try clearing search terms or status filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {c._id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Orders Placed */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
                        <ShoppingBag className="w-3 h-3 text-slate-500" />
                        {c.totalOrders || 0} order{(c.totalOrders || 0) !== 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatPrice(c.lifetimeSpend || 0, { currencySymbol })}
                    </td>

                    {/* Saved Addresses */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.addresses?.length ? (
                        <span>{c.addresses.length} saved address{c.addresses.length > 1 ? 'es' : ''}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                          <Ban className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Active / Suspend Switch */}
                        <label
                          className="relative inline-flex items-center cursor-pointer mr-1"
                          title={c.isActive ? 'Suspend customer account' : 'Reactivate account'}
                        >
                          <input
                            type="checkbox"
                            checked={c.isActive}
                            disabled={updatingId === c._id}
                            onChange={() => handleToggleStatus(c)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>

                        {/* Inspect profile drawer */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomerId(c._id);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-700">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-slate-700">
                {Math.min(page * limit, totalCount)}
              </strong>{' '}
              of <strong className="text-slate-700">{totalCount}</strong> customers
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Profile Drawer */}
      <CustomerDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCustomerId(null);
        }}
        customerId={selectedCustomerId}
        onStatusUpdated={() => {
          fetchCustomers();
          fetchStats();
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
export default CustomersPage;
