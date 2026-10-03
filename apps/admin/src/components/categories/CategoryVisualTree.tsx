import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Folder,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { CategoryTreeNode } from '@shared/types/catalog';
import StatusPill from '@shared/ui/StatusPill';
import Button from '@shared/ui/Button';

export interface CategoryVisualTreeProps {
  categories: CategoryTreeNode[];
  onAddSubcategory: (parent: CategoryTreeNode) => void;
  onEdit: (category: CategoryTreeNode) => void;
  onDelete: (category: CategoryTreeNode) => void;
  onToggleStatus: (category: CategoryTreeNode) => void;
  onMoveOrder?: (category: CategoryTreeNode, direction: 'up' | 'down') => void;
}

interface TreeNodeItemProps {
  node: CategoryTreeNode;
  depth: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onAddSubcategory: (parent: CategoryTreeNode) => void;
  onEdit: (category: CategoryTreeNode) => void;
  onDelete: (category: CategoryTreeNode) => void;
  onToggleStatus: (category: CategoryTreeNode) => void;
  onMoveOrder?: (category: CategoryTreeNode, direction: 'up' | 'down') => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  expandedIds,
  toggleExpand,
  onAddSubcategory,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
}) => {
  const isExpanded = expandedIds.has(node._id);
  const hasChildren = node.children && node.children.length > 0;

  const badgeColorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="relative">
      <div
        className={`group flex items-center justify-between py-2.5 px-3 rounded-md transition-colors border ${
          node.status === 'ACTIVE'
            ? 'bg-white border-slate-200 hover:border-slate-300'
            : 'bg-slate-50 border-slate-200/70 opacity-75 hover:opacity-100'
        }`}
        style={{ marginLeft: `${depth * 28}px` }}
      >
        {/* Left: Caret + Thumbnail + Title & Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node._id)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          )}

          {/* Thumbnail / Icon */}
          <div className="w-8 h-8 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
            {node.thumbnailUrl ? (
              <img
                src={node.thumbnailUrl}
                alt={node.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : node.iconUrl ? (
              <img
                src={node.iconUrl}
                alt={node.name}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Folder className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {/* Name & Slug */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {node.name}
              </span>
              <span className="text-xs text-slate-600 font-mono hidden sm:inline truncate">
                /{node.slug}
              </span>
              {node.badge?.text && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                    badgeColorMap[node.badge.color || 'indigo'] || badgeColorMap.indigo
                  }`}
                >
                  {node.badge.text}
                </span>
              )}
              {node.isFeatured && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
              Lvl {node.level}
            </span>
            <span className="text-slate-400">·</span>
            <span>{node.productCount || 0} products</span>
            {hasChildren && (
              <>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">
                  {node.children.length} subcategories
                </span>
              </>
            )}
          </div>

          <StatusPill tone={node.status === 'ACTIVE' ? 'success' : 'neutral'}>
            {node.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </StatusPill>

          <div className="flex items-center gap-1">
            {onMoveOrder && (
              <>
                <button
                  type="button"
                  onClick={() => onMoveOrder(node, 'up')}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveOrder(node, 'down')}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onToggleStatus(node)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={node.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
            >
              {node.status === 'ACTIVE' ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onAddSubcategory(node)}
              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Add Child Subcategory"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onEdit(node)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Edit Category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(node)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="relative mt-1 space-y-1">
          {/* Vertical connecting line */}
          <div
            className="absolute top-0 bottom-3 w-px bg-slate-200"
            style={{ left: `${depth * 28 + 15}px` }}
          />
          {node.children.map((child: CategoryTreeNode) => (
            <TreeNodeItem
              key={child._id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              onAddSubcategory={onAddSubcategory}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onMoveOrder={onMoveOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryVisualTree: React.FC<CategoryVisualTreeProps> = ({
  categories,
  onAddSubcategory,
  onEdit,
  onDelete,
  onToggleStatus,
  onMoveOrder,
}) => {
  // Collect all category IDs helper
  const getAllIds = (nodes: CategoryTreeNode[]): string[] => {
    let ids: string[] = [];
    for (const n of nodes) {
      ids.push(n._id);
      if (n.children && n.children.length > 0) {
        ids = ids.concat(getAllIds(n.children));
      }
    }
    return ids;
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Expand root level by default
    return new Set(categories.map((c) => c._id));
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(getAllIds(categories)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-10 text-center shadow-none">
        <Folder className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-900">No categories found</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Start organizing your product catalog by creating your first department or root taxonomy.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-none">
      {/* Tree Controls Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Taxonomy Hierarchy</span>
          <span>·</span>
          <span>{categories.length} root branches</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="outline" onClick={expandAll}>
            Expand all
          </Button>
          <Button size="xs" variant="outline" onClick={collapseAll}>
            Collapse all
          </Button>
        </div>
      </div>

      {/* Tree Nodes List */}
      <div className="space-y-1">
        {categories.map((rootNode) => (
          <TreeNodeItem
            key={rootNode._id}
            node={rootNode}
            depth={0}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            onAddSubcategory={onAddSubcategory}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onMoveOrder={onMoveOrder}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryVisualTree;
