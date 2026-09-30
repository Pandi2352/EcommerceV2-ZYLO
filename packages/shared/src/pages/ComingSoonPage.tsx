import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

export interface ComingSoonPageProps {
  title: string;
  backTo: string;
  backLabel: string;
}

/**
 * Placeholder for routes that are planned but not built yet. Renders inside
 * whichever layout owns the route, so navigation keeps the correct shell.
 */
export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, backTo, backLabel }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
        <Construction className="w-6 h-6" />
      </div>
      <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        This section is under construction and will be available soon.
      </p>
      <Link
        to={backTo}
        className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{backLabel}</span>
      </Link>
    </div>
  );
};

export default ComingSoonPage;
