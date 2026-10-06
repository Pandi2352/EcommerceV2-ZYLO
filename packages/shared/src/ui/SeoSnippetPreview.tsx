import React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SeoSnippetPreviewProps {
  title: string;
  description: string;
  slug: string;
  domain?: string;
  modulePath?: string;
  className?: string;
}

/**
 * Reusable Google Search Result live snippet simulator.
 * Renders the search breadcrumb, clickable blue title, and description clamp.
 */
export const SeoSnippetPreview: React.FC<SeoSnippetPreviewProps> = ({
  title,
  description,
  slug,
  domain = 'zylo.com',
  modulePath = 'brands',
  className = '',
}) => {
  return (
    <div className={cn('p-3.5 border border-slate-200 rounded-md bg-white shadow-none', className)}>
      <div className="flex items-center gap-1.5 mb-2">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Search Engine Listing Preview
        </span>
      </div>
      <div className="space-y-0.5">
        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
          <span>{domain}</span>
          <span className="text-slate-400">›</span>
          <span>{modulePath}</span>
          <span className="text-slate-400">›</span>
          <span className="text-slate-800 font-medium">{slug || '...'}</span>
        </div>
        <h4 className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer truncate">
          {title || 'Untitled Resource | ZYLO'}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {description || 'Provide a concise meta description to preview how your page will appear in search results.'}
        </p>
      </div>
    </div>
  );
};

export default SeoSnippetPreview;
