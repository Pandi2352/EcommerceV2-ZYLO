import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';

export interface NotFoundPageProps {
  homeTo?: string;
  homeLabel?: string;
}

/**
 * Layout-agnostic 404 content. Each portal mounts it inside its own layout
 * (customer storefront or admin console) via a scoped catch-all route.
 */
export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  homeTo = ROUTES.CUSTOMER.HOME,
  homeLabel = 'Back to Home',
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="text-6xl sm:text-8xl font-black text-slate-200 tracking-tighter">
        404
      </span>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to={homeTo}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#2A3B5C] rounded-md hover:bg-[#1E2B43] transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{homeLabel}</span>
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
