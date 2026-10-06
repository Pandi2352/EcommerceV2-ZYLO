import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Star,
  Edit2,
  Trash2,
  Layers,
  Award,
  Package,
  Boxes,
} from 'lucide-react';
import Button from '@shared/ui/Button';
import Dropdown, { type DropdownOption } from '@shared/ui/Dropdown';
import Pagination from '@shared/ui/Pagination';
import PageHeader from '@shared/ui/PageHeader';
import { ApiLoader } from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { productsService } from '@shared/api/products.service';
import { categoriesService } from '@shared/api/categories.service';
import { brandsService } from '@shared/api/brands.service';
import type {
  ProductItem,
  ProductMetrics,
  ProductStatus,
  CreateProductPayload,
  UpdateProductPayload,
} from '@shared/types/product';
import ProductMetricsCards from '../components/products/ProductMetricsCards';
import ProductFormDrawer from '../components/products/ProductFormDrawer';
import DeleteProductDialog from '../components/products/DeleteProductDialog';

export const ProductsPage: React.FC = () => {
  // Data state
  const [items, setItems] = useState<ProductItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMetricsLoading, setIsMetricsLoading] = useState<boolean>(false);

  // Filter options loaded from APIs
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption<string>[]>([
    { value: 'ALL', label: 'All Categories' },
  ]);
  const [brandOptions, setBrandOptions] = useState<DropdownOption<string>[]>([
    { value: 'ALL', label: 'All Brands' },
  ]);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock'>('newest');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Load dropdown categories and brands
  useEffect(() => {
    categoriesService
      .list({ limit: 100 })
      .then((res) => {
        const cats = (res.items || []).map((c) => ({
          value: c._id,
          label: c.name,
        }));
        setCategoryOptions([{ value: 'ALL', label: 'All Categories' }, ...cats]);
      })
      .catch((err: unknown) => console.error('Failed to load categories', err));

    brandsService
      .list({ limit: 100 })
      .then((res) => {
        const bnds = (res.items || []).map((b) => ({
          value: b._id,
          label: b.name,
        }));
        setBrandOptions([{ value: 'ALL', label: 'All Brands' }, ...bnds]);
      })
      .catch((err) => console.error('Failed to load brands', err));
  }, []);

  // Fetch KPI metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setIsMetricsLoading(true);
      const data = await productsService.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.error('Failed to load product metrics:', err);
    } finally {
      setIsMetricsLoading(false);
    }
  }, []);

  // Fetch paginated products list
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await productsService.list({
        search: search.trim() || undefined,
        categoryId: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        brandId: brandFilter !== 'ALL' ? brandFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        stockStatus: stockFilter !== 'ALL' ? stockFilter : undefined,
        sortBy,
        page,
        limit: pageSize,
      });
      setItems(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, brandFilter, statusFilter, stockFilter, sortBy, page, pageSize]);

  const reloadData = useCallback(async () => {
    await Promise.all([fetchMetrics(), fetchProducts()]);
  }, [fetchMetrics, fetchProducts]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Drawer open handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setIsDrawerOpen(true);
  };

  // Submit create or edit
  const handleFormSubmit = async (payload: CreateProductPayload | UpdateProductPayload) => {
    if (editingProduct) {
      await productsService.update(editingProduct._id, payload);
      toast.success(`Product "${payload.name || editingProduct.name}" updated successfully.`);
    } else {
      await productsService.create(payload as CreateProductPayload);
      toast.success(`Product "${payload.name}" created successfully.`);
    }
    reloadData();
  };

  // Toggle Featured
  const handleToggleFeatured = async (prod: ProductItem) => {
    try {
      await productsService.toggleFeatured(prod._id);
      toast.success(
        prod.isFeatured
          ? `Removed "${prod.name}" from featured spotlight.`
          : `Featured "${prod.name}" on homepage.`
      );
      setItems((prev) =>
        prev.map((item) => (item._id === prod._id ? { ...item, isFeatured: !item.isFeatured } : item))
      );
      fetchMetrics();
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Status Change
  const handleStatusChange = async (prod: ProductItem, newStatus: ProductStatus) => {
    try {
      await productsService.updateStatus(prod._id, newStatus);
      toast.success(`Status for "${prod.name}" set to ${newStatus}.`);
      setItems((prev) =>
        prev.map((item) => (item._id === prod._id ? { ...item, status: newStatus } : item))
      );
      fetchMetrics();
    } catch (err: any) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Delete product
  const handleDeleteConfirm = async (prodId: string) => {
    const res = await productsService.delete(prodId);
    toast.success(res.message);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Product Catalog"
        description="Manage store merchandise, SKU variants, inventory levels, and storefront spotlights."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reloadData()}
              disabled={isLoading}
              className="rounded-md shadow-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="rounded-md shadow-none"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* KPI Metrics */}
      <ProductMetricsCards metrics={metrics} isLoading={isMetricsLoading} />

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-md shadow-none space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, SKU, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <Dropdown<string>
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
              options={categoryOptions}
            />
          </div>

          {/* Brand Dropdown */}
          <div className="md:col-span-2">
            <Dropdown<string>
              value={brandFilter}
              onChange={(val) => {
                setBrandFilter(val);
                setPage(1);
              }}
              options={brandOptions}
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <Dropdown<ProductStatus | 'ALL'>
              value={statusFilter}
              onChange={(val) => {
                if (val) setStatusFilter(val as ProductStatus | 'ALL');
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />
          </div>

          {/* Stock Dropdown */}
          <div className="md:col-span-1">
            <Dropdown<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>
              value={stockFilter}
              onChange={(val) => {
                if (val) setStockFilter(val as 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK');
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Stock' },
                { value: 'IN_STOCK', label: 'In Stock' },
                { value: 'LOW_STOCK', label: 'Low Stock' },
                { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
              ]}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <Dropdown<'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock'>
              value={sortBy}
              onChange={(val) => {
                if (val) setSortBy(val as 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'stock');
                setPage(1);
              }}
              options={[
                { value: 'newest', label: 'Sort: Newest' },
                { value: 'price_asc', label: 'Price: Low-High' },
                { value: 'price_desc', label: 'Price: High-Low' },
                { value: 'name_asc', label: 'Name: A-Z' },
                { value: 'stock', label: 'Inventory Level' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-200 rounded-md shadow-none overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <ApiLoader text="Loading catalog products..." />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No catalog items match your search and filter criteria. Try adjusting filters or create a new item.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCreate}
              className="mt-4 rounded-md shadow-none"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Taxonomy</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((prod) => {
                  const isLow = prod.stockQuantity <= prod.lowStockThreshold && prod.stockQuantity > 0;
                  const isOut = prod.stockQuantity <= 0;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                            {prod.thumbnailUrl ? (
                              <img
                                src={prod.thumbnailUrl}
                                alt={prod.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h4 className="text-xs font-semibold text-slate-900 truncate">{prod.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-slate-500">{prod.sku}</span>
                              {prod.hasVariants && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-medium">
                                  <Boxes className="w-2.5 h-2.5" />
                                  {prod.variants?.length || 0} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prod.categoryId?.name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            <span>{prod.brandId?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div>
                          {prod.salePrice ? (
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900">${prod.salePrice}</span>
                              <span className="block text-[11px] text-slate-400 line-through">
                                ${prod.basePrice}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-900">${prod.basePrice}</span>
                          )}
                        </div>
                      </td>

                      {/* Inventory Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-semibold text-slate-800">{prod.stockQuantity}</span>
                          <span className="text-slate-400 text-[11px]">
                            {isOut ? '(Out of stock)' : isLow ? '(Low stock)' : 'in stock'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              prod,
                              prod.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                            )
                          }
                          title="Click to toggle status"
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80 ${
                            prod.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prod.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {prod.status}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(prod)}
                          title={prod.isFeatured ? 'Featured spotlight' : 'Click to spotlight'}
                          className={`p-1 rounded transition-colors ${
                            prod.isFeatured
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 rounded-md"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProductToDelete(prod);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 rounded-md"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Right-Aligned Pagination */}
        {totalCount > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-white">
            <Pagination
              page={page}
              total={totalCount}
              pageSize={pageSize}
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

      {/* Product Form Drawer */}
      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        product={productToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductsPage;
