import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Star,
  Edit2,
  Trash2,
  Globe,
  X,
} from 'lucide-react';
import Button from '@shared/ui/Button';
import Dropdown, { type DropdownOption } from '@shared/ui/Dropdown';
import Pagination from '@shared/ui/Pagination';
import PageHeader from '@shared/ui/PageHeader';
import { ApiLoader } from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { brandsService } from '@shared/api/brands.service';
import type {
  BrandItem,
  BrandStats,
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@shared/types/brand';
import BrandMetricsCards from '../components/brands/BrandMetricsCards';
import BrandFormDrawer from '../components/brands/BrandFormDrawer';
import DeleteBrandDialog from '../components/brands/DeleteBrandDialog';

export const BrandsPage: React.FC = () => {
  // Data state
  const [items, setItems] = useState<BrandItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<'ALL' | 'FEATURED' | 'STANDARD'>('ALL');
  const [countryFilter, setCountryFilter] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Load KPI stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const data = await brandsService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load brand statistics:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Load paginated list
  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const isFeaturedParam =
        featuredFilter === 'FEATURED' ? true : featuredFilter === 'STANDARD' ? false : undefined;

      const res = await brandsService.list({
        search: search.trim() || undefined,
        status: statusFilter,
        country: countryFilter || undefined,
        isFeatured: isFeaturedParam,
        page,
        limit: pageSize,
        sortBy: 'displayOrder',
        sortOrder: 'asc',
      });
      setItems(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, featuredFilter, countryFilter, page, pageSize]);

  // Combined reload
  const reloadData = useCallback(async () => {
    await Promise.all([fetchStats(), fetchBrands()]);
  }, [fetchStats, fetchBrands]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handle open create
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setIsDrawerOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setIsDrawerOpen(true);
  };

  // Handle open delete
  const handleOpenDelete = (brand: BrandItem) => {
    setBrandToDelete(brand);
    setIsDeleteDialogOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (brand: BrandItem) => {
    try {
      const updated = await brandsService.toggleStatus(brand._id);
      setItems((prev) => prev.map((item) => (item._id === brand._id ? updated : item)));
      toast.success(`Brand "${brand.name}" set to ${updated.status}.`);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle status');
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (brand: BrandItem) => {
    try {
      const updated = await brandsService.toggleFeatured(brand._id);
      setItems((prev) => prev.map((item) => (item._id === brand._id ? updated : item)));
      toast.success(
        `Brand "${brand.name}" ${updated.isFeatured ? 'featured on homepage' : 'removed from featured'}.`,
      );
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle featured status');
    }
  };

  // Handle save brand from drawer
  const handleSaveForm = async (payload: CreateBrandPayload | UpdateBrandPayload) => {
    if (editingBrand) {
      await brandsService.update(editingBrand._id, payload);
      toast.success(`Brand "${payload.name || editingBrand.name}" updated successfully.`);
    } else {
      await brandsService.create(payload as CreateBrandPayload);
      toast.success(`Brand "${payload.name}" created successfully.`);
    }
    await reloadData();
  };

  // Handle delete brand confirm
  const handleDeleteConfirm = async (brandId: string) => {
    const res = await brandsService.delete(brandId);
    toast.success(res.message);
    await reloadData();
  };

  // Build country filter options from stats
  const countryFilterOptions: DropdownOption<string>[] = useMemo(() => {
    const list: DropdownOption<string>[] = [{ value: '', label: 'All Countries' }];
    if (stats?.topCountries) {
      stats.topCountries.forEach((c) => {
        list.push({
          value: c.country,
          label: `${c.country} (${c.count})`,
        });
      });
    }
    return list;
  }, [stats]);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== 'ALL' || featuredFilter !== 'ALL' || countryFilter,
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setFeaturedFilter('ALL');
    setCountryFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Brand Directory"
        description="Manage partner manufacturers, brand logos, featured showcases, and product catalog attribution."
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reloadData}
              className="rounded-md shadow-none flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="rounded-md shadow-none flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Brand</span>
            </Button>
          </div>
        }
      />

      {/* KPI Count Cards */}
      <BrandMetricsCards stats={stats} isLoading={isStatsLoading} />

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-none space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by brand name, slug, country, or description..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="w-36">
              <Dropdown<'ACTIVE' | 'INACTIVE' | 'ALL'>
                size="sm"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val || 'ALL');
                  setPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active Only' },
                  { value: 'INACTIVE', label: 'Inactive Only' },
                ]}
              />
            </div>

            {/* Featured Filter */}
            <div className="w-36">
              <Dropdown<'ALL' | 'FEATURED' | 'STANDARD'>
                size="sm"
                value={featuredFilter}
                onChange={(val) => {
                  setFeaturedFilter(val || 'ALL');
                  setPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Brands' },
                  { value: 'FEATURED', label: 'Featured Only' },
                  { value: 'STANDARD', label: 'Standard' },
                ]}
              />
            </div>

            {/* Country Filter */}
            <div className="w-44">
              <Dropdown<string>
                size="sm"
                value={countryFilter}
                onChange={(val) => {
                  setCountryFilter(val || '');
                  setPage(1);
                }}
                options={countryFilterOptions}
                placeholder="Filter by country..."
                searchable
                clearable
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-md shadow-none text-slate-600 hover:text-rose-600 hover:border-rose-300"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Brands Table View */}
      {isLoading ? (
        <ApiLoader size="md" text="Loading brand catalog directory..." />
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-none">
          <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No brands found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {hasActiveFilters
              ? 'No brand partners matched your active filters. Try adjusting your query.'
              : 'Start building your catalog by adding your first brand partner.'}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="rounded-md shadow-none"
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="rounded-md shadow-none"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add First Brand
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Brand Partner</th>
                    <th className="py-3 px-4">Slug Route</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((brand, idx) => (
                    <tr
                      key={brand._id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* Brand Logo & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md border border-slate-200 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-none">
                            {brand.logoUrl ? (
                              <img
                                src={brand.logoUrl}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {brand.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 truncate">
                                {brand.name}
                              </span>
                              {brand.website && (
                                <a
                                  href={
                                    brand.website.startsWith('http')
                                      ? brand.website
                                      : `https://${brand.website}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`Visit ${brand.website}`}
                                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {brand.description && (
                              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                                {brand.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-slate-500">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          /{brand.slug}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4">
                        {brand.countryOfOrigin ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                            {brand.countryOfOrigin}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unspecified</span>
                        )}
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(brand)}
                          title={brand.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                          className={`p-1.5 rounded-md transition-colors ${
                            brand.isFeatured
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              brand.isFeatured ? 'fill-amber-500' : 'fill-transparent'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Status Toggle & Pill */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(brand)}
                          className="inline-flex items-center gap-1.5 cursor-pointer focus:outline-none"
                          title="Click to toggle status"
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              brand.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              brand.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {brand.status}
                          </span>
                        </button>
                      </td>

                      {/* Display Order */}
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {brand.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(brand)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit brand"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(brand)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Card (Right-aligned controls) */}
          {totalCount > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-3 shadow-none">
              <Pagination
                className="w-full"
                page={page}
                pageSize={pageSize}
                total={totalCount}
                pageSizeOptions={[5, 10, 15, 20, 50]}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Drawer */}
      <BrandFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveForm}
        initialData={editingBrand}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteBrandDialog
        isOpen={isDeleteDialogOpen}
        brand={brandToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setBrandToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default BrandsPage;
