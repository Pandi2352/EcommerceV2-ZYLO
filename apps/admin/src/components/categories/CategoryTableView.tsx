import {
  Folder,
  Edit2,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { CategoryItem } from '@shared/types/catalog';
import StatusPill from '@shared/ui/StatusPill';

export interface CategoryTableViewProps {
  items: CategoryItem[];
  onAddSubcategory: (category: CategoryItem) => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
  onToggleStatus: (category: CategoryItem) => void;
}

export const CategoryTableView: React.FC<CategoryTableViewProps> = ({
  items,
  onAddSubcategory,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-10 text-center shadow-none">
        <Folder className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-900">No categories found</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Try adjusting your search criteria or create a new category.
        </p>
      </div>
    );
  }

  const badgeColorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-none overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Parent / Hierarchy</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4 text-center">Products</th>
              <th className="py-3 px-4 text-center">Order</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((cat) => {
              const parentName =
                typeof cat.parentId === 'object' && cat.parentId
                  ? cat.parentId.name
                  : null;

              return (
                <tr
                  key={cat._id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Category Name & Media */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                        {cat.thumbnailUrl ? (
                          <img
                            src={cat.thumbnailUrl}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : cat.iconUrl ? (
                          <img
                            src={cat.iconUrl}
                            alt={cat.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Folder className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {cat.name}
                          </span>
                          {cat.badge?.text && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                badgeColorMap[cat.badge.color || 'indigo'] ||
                                badgeColorMap.indigo
                              }`}
                            >
                              {cat.badge.text}
                            </span>
                          )}
                          {cat.isFeatured && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          /{cat.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Parent / Hierarchy Breadcrumb */}
                  <td className="py-3 px-4">
                    {parentName ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                        {parentName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Root Department
                      </span>
                    )}
                  </td>

                  {/* Level */}
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Lvl {cat.level}
                    </span>
                  </td>

                  {/* Products */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-medium text-slate-700">
                      {cat.productCount || 0}
                    </span>
                  </td>

                  {/* Order */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs text-slate-500 font-mono">
                      {cat.displayOrder}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <StatusPill tone={cat.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {cat.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </StatusPill>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(cat)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {cat.status === 'ACTIVE' ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddSubcategory(cat)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Add Subcategory"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(cat)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(cat)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTableView;
