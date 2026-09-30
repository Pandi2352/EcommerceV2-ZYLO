import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';

interface CategoryItem {
  id: number;
  name: string;
  count: string;
}

const TOP_CATEGORIES: CategoryItem[] = [
  { id: 1, name: 'Mobile & Accessories', count: '(10,294)' },
  { id: 2, name: 'Desktop', count: '(6,256)' },
  { id: 3, name: 'Electronics', count: '(3,479)' },
  { id: 4, name: 'Home & Furniture', count: '(2,275)' },
  { id: 5, name: 'Grocery', count: '(1,895)' },
  { id: 6, name: 'Fashion', count: '(1,382)' },
  { id: 7, name: 'Appliances', count: '(1,037)' },
];

export const TopCategoriesCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          TOP 10 CATEGORIES
        </h3>
        <Link
          to={ROUTES.CATEGORIES}
          className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3.5">
        {TOP_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between text-xs font-medium text-slate-700 hover:text-[#405189] transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">{cat.id}.</span>
              <span className="group-hover:translate-x-0.5 transition-transform">
                {cat.name}
              </span>
            </span>
            <span className="text-slate-400 font-normal">{cat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCategoriesCard;
