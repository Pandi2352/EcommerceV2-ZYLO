import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { SIDEBAR_CLASSES } from './sidebarStyles';

export interface SubPageItem {
  label: string;
  to: string;
  badge?: {
    text: string;
    color: string;
  };
}

export interface SidebarGroupProps {
  id: string;
  label: string;
  icon: LucideIcon;
  pages: SubPageItem[];
  badge?: {
    text: string;
    color: string;
  };
  isCollapsed?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: () => void;
  onPageClick?: () => void;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  label,
  icon: Icon,
  pages,
  badge,
  isCollapsed = false,
  isOpen = false,
  onToggleOpen,
  onMouseEnter,
  onMouseLeave,
  onPageClick,
}) => {
  const location = useLocation();

  const isPageActive = (to: string) => {
    if (to === '/' && location.pathname === '/') return true;
    return location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  };

  const isGroupActive = pages.some((p) => isPageActive(p.to));

  // Collapsed Mode: Renders single rail icon button with hover trigger
  if (isCollapsed) {
    return (
      <div
        className="px-2"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          type="button"
          title={label}
          className={`${SIDEBAR_CLASSES.railButton} ${
            isGroupActive ? SIDEBAR_CLASSES.railButtonActive : SIDEBAR_CLASSES.railButtonInactive
          }`}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Expanded Mode: Accordion trigger button + sub-pages list
  return (
    <div className="px-2">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`${SIDEBAR_CLASSES.itemTrigger} ${
          isGroupActive ? SIDEBAR_CLASSES.itemTriggerActive : SIDEBAR_CLASSES.itemTriggerInactive
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
              {badge.text}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-slate-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded sub-pages */}
      {isOpen && (
        <div className="pl-6 pr-2 py-1 space-y-0.5">
          {pages.map((page) => {
            const active = isPageActive(page.to);
            return (
              <NavLink
                key={page.to}
                to={page.to}
                onClick={onPageClick}
                className={`${SIDEBAR_CLASSES.subNavLink} ${
                  active ? SIDEBAR_CLASSES.subNavLinkActive : SIDEBAR_CLASSES.subNavLinkInactive
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-0.5 bg-slate-500 rounded" />
                  <span>{page.label}</span>
                </span>
                {page.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${page.badge.color}`}>
                    {page.badge.text}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarGroup;
