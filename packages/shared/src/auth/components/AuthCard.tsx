import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ZyloLogo from '../../ui/ZyloLogo';
import CornerDots from '../../ui/CornerDots';
import { usePortal } from '../PortalContext';

export interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Content under a divider inside the card (security notes, secondary links) */
  footer?: React.ReactNode;
  /** Link rendered below the card. Absolute URLs (another app) open as plain links. */
  backLink?: { to: string; label: string };
}

const BACK_LINK_CLASS =
  'inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer';

/**
 * Centered, full-page card used for single-purpose auth steps: admin sign-in,
 * two-factor challenge, forgot/reset password, email verification.
 */
export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children, footer, backLink }) => {
  const { routes } = usePortal();
  return (
  <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
    <CornerDots />

    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8">
        <div className="mb-6 text-left">
          <Link
            to={routes.home}
            className="inline-flex items-center transition-transform duration-200 hover:scale-105 mb-4 cursor-pointer"
          >
            <ZyloLogo variant="full" size="md" theme="light" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="mt-6 pt-4 border-t border-slate-100">{footer}</div>}
      </div>

      {backLink && (
        <div className="mt-6 text-center">
          {/^https?:\/\//.test(backLink.to) ? (
            <a href={backLink.to} className={BACK_LINK_CLASS}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLink.label}</span>
            </a>
          ) : (
            <Link to={backLink.to} className={BACK_LINK_CLASS}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{backLink.label}</span>
            </Link>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default AuthCard;
