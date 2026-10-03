import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ImageOff, FileText, CheckCircle2 } from 'lucide-react';
import ChartCard from '@shared/charts/ChartCard';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface CategoryHealthCardProps {
  data: CategoryOverviewData;
}

/** Highlights categories that require content, SEO, or media attention */
export const CategoryHealthCard: React.FC<CategoryHealthCardProps> = ({ data }) => {
  const { health } = data;
  const items = health.attentionCategories;

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Catalog Quality & SEO Health"
      subtitle={`${health.missingBanners} missing banners · ${health.missingSeo} missing SEO meta`}
    >
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">All categories are healthy!</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Every category has complete assets, SEO, and active status.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories?search=${encodeURIComponent(cat.name)}`}
              className="flex items-center justify-between p-2 rounded-md border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Level {cat.level} · /{cat.slug}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {cat.status === 'INACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Inactive
                  </span>
                )}
                {cat.missingBanner && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Missing desktop banner image">
                    <ImageOff className="w-2.5 h-2.5" />
                    No Banner
                  </span>
                )}
                {cat.missingSeo && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200" title="Missing SEO meta description">
                    <FileText className="w-2.5 h-2.5" />
                    No SEO
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </ChartCard>
  );
};

export default CategoryHealthCard;
