import React from 'react';

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-md border border-slate-200 bg-white animate-pulse">
        <div className="w-full sm:w-48 h-48 rounded-md bg-slate-100 shrink-0" />
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-2.5">
            <div className="h-3 bg-slate-100 rounded w-24" />
            <div className="h-5 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-3.5 bg-slate-100 rounded w-5/6" />
          </div>
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            <div className="h-6 bg-slate-100 rounded w-28" />
            <div className="h-8 bg-slate-100 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-3.5 animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="w-full aspect-square rounded-md bg-slate-100 mb-3" />
      {/* Category / Brand tags */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-3 bg-slate-100 rounded w-16" />
        <div className="h-3 bg-slate-100 rounded w-12" />
      </div>
      {/* Product Name */}
      <div className="h-4 bg-slate-100 rounded w-4/5 mb-1.5" />
      <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
      {/* Stars rating */}
      <div className="h-3 bg-slate-100 rounded w-24 mb-4" />
      {/* Price & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
        <div className="h-5 bg-slate-100 rounded w-20" />
        <div className="h-8 bg-slate-100 rounded w-8" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
