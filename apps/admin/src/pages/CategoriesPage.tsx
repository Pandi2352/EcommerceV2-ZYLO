import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  FolderTree,
  Table as TableIcon,
} from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import PageHeader from '@shared/ui/PageHeader';
import Button from '@shared/ui/Button';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import Pagination from '@shared/ui/Pagination';
import { ApiLoader } from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { categoriesService } from '@shared/api/categories.service';
import type {
  CategoryItem,
  CategoryTreeNode,
  CategoryStats,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@shared/types/catalog';

import CategoryMetricsCards from '../components/categories/CategoryMetricsCards';
import CategoryVisualTree from '../components/categories/CategoryVisualTree';
import CategoryTableView from '../components/categories/CategoryTableView';
import CategoryFormDrawer from '../components/categories/CategoryFormDrawer';
import DeleteCategoryDialog from '../components/categories/DeleteCategoryDialog';

export const CategoriesPage: React.FC = () => {
  const { can } = useAuth();

  // State
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [flatItems, setFlatItems] = useState<CategoryItem[]>([]);
  const [allFlatCategories, setAllFlatCategories] = useState<CategoryItem[]>([]);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Loaders
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [subcatParentId, setSubcatParentId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Flatten tree to get all flat categories for parent picker dropdown
  const flattenTree = (nodes: CategoryTreeNode[]): CategoryItem[] => {
    let list: CategoryItem[] = [];
    for (const node of nodes) {
      list.push(node);
      if (node.children && node.children.length > 0) {
        list = list.concat(flattenTree(node.children));
      }
    }
    return list;
  };

  // Load stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const data = await categoriesService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load category stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Load tree
  const fetchTree = useCallback(async () => {
    try {
      const data = await categoriesService.getTree(
        statusFilter === 'ALL' ? undefined : statusFilter,
      );
      setTreeData(data);
      setAllFlatCategories(flattenTree(data));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, [statusFilter]);

  // Load paginated flat list (for table view)
  const fetchFlatList = useCallback(async () => {
    try {
      const res = await categoriesService.list({
        search: search.trim() || undefined,
        status: statusFilter,
        page,
        limit: pageSize,
        sortBy: 'displayOrder',
        sortOrder: 'asc',
      });
      setFlatItems(res.items);
      setTotalCount(res.total);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, [search, statusFilter, page, pageSize]);

  // Combined reload
  const reloadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchStats(), fetchTree(), fetchFlatList()]);
    setIsLoading(false);
  }, [fetchStats, fetchTree, fetchFlatList]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Actions
  const handleOpenCreateRoot = () => {
    setEditingCategory(null);
    setSubcatParentId(null);
    setIsDrawerOpen(true);
  };

  const handleOpenAddSubcategory = (parent: CategoryItem) => {
    setEditingCategory(null);
    setSubcatParentId(parent._id);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setSubcatParentId(null);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (category: CategoryItem) => {
    try {
      const updated = await categoriesService.toggleStatus(category._id);
      toast.success(
        `Category "${updated.name}" is now ${updated.status.toLowerCase()}.`,
        { title: 'Status updated' },
      );
      fetchTree();
      fetchFlatList();
      fetchStats();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleOpenDelete = (category: CategoryItem) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (categoryId: string, reassignToId?: string) => {
    try {
      const res = await categoriesService.delete(categoryId, reassignToId);
      toast.success(res.message, { title: 'Category deleted' });
      reloadData();
    } catch (err) {
      throw err;
    }
  };

  const handleSaveForm = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    if (editingCategory) {
      await categoriesService.update(editingCategory._id, payload);
      toast.success(`Category "${payload.name}" updated successfully.`, {
        title: 'Category updated',
      });
    } else {
      await categoriesService.create(payload as CreateCategoryPayload);
      toast.success(`Category "${payload.name}" created successfully.`, {
        title: 'Category created',
      });
    }
    reloadData();
  };

  // Reordering display order
  const handleMoveOrder = async (category: CategoryTreeNode, direction: 'up' | 'down') => {
    // Find siblings
    const parentId =
      typeof category.parentId === 'object' && category.parentId
        ? category.parentId._id
        : category.parentId || null;

    const siblings = allFlatCategories
      .filter((c: CategoryItem) => {
        const cParentId =
          typeof c.parentId === 'object' && c.parentId ? c.parentId._id : c.parentId || null;
        return cParentId === parentId;
      })
      .sort((a: CategoryItem, b: CategoryItem) => a.displayOrder - b.displayOrder);

    const currentIndex = siblings.findIndex((s: CategoryItem) => s._id === category._id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const targetSibling = siblings[targetIndex];

    try {
      await categoriesService.reorder([
        { id: category._id, displayOrder: targetSibling.displayOrder, parentId },
        { id: targetSibling._id, displayOrder: category.displayOrder, parentId },
      ]);
      fetchTree();
      fetchFlatList();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Filter tree nodes client-side if searching in tree mode
  const filteredTreeData = useMemo(() => {
    if (!search.trim()) return treeData;
    const query = search.trim().toLowerCase();

    const filterNodes = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      const matches: CategoryTreeNode[] = [];
      for (const node of nodes) {
        const nameMatches =
          node.name.toLowerCase().includes(query) ||
          node.slug.toLowerCase().includes(query) ||
          node.description?.toLowerCase().includes(query);

        const filteredChildren =
          node.children && node.children.length > 0 ? filterNodes(node.children) : [];

        if (nameMatches || filteredChildren.length > 0) {
          matches.push({
            ...node,
            children: filteredChildren,
          });
        }
      }
      return matches;
    };

    return filterNodes(treeData);
  }, [treeData, search]);

  return (
    <div>
      <PageHeader
        title="Categories"
        count={stats?.total}
        description="Organize store taxonomy, visual banners, navigation hierarchy, and faceted search filters."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />}
              onClick={reloadData}
            >
              Refresh
            </Button>
            {can('categories.create') && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenCreateRoot}
              >
                Add Category
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Count Cards */}
      <CategoryMetricsCards stats={stats} isLoading={isStatsLoading} />

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-md p-3 mb-4 shadow-none flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search categories or slugs..."
            />
          </div>

          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as any);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active in Store' },
              { value: 'INACTIVE', label: 'Hidden / Inactive' },
            ]}
          />
        </div>

        {/* Right: View Mode Toggle (Visual Tree vs Flat Table) */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-white text-slate-900 shadow-none border border-slate-200 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Visual Tree</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-none border border-slate-200 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Flat Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <ApiLoader size="md" text="Loading categories hierarchy and taxonomy..." />
      ) : viewMode === 'tree' ? (
        <CategoryVisualTree
          categories={filteredTreeData}
          onAddSubcategory={handleOpenAddSubcategory}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleStatus={handleToggleStatus}
          onMoveOrder={handleMoveOrder}
        />
      ) : (
        <div className="space-y-4">
          <CategoryTableView
            items={flatItems}
            onAddSubcategory={handleOpenAddSubcategory}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleStatus={handleToggleStatus}
          />
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
      <CategoryFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveForm}
        initialData={editingCategory}
        initialParentId={subcatParentId}
        allCategories={allFlatCategories}
      />

      {/* Delete / Reassign Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        category={categoryToDelete}
        allCategories={allFlatCategories}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CategoriesPage;
