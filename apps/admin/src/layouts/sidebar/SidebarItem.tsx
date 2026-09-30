import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { SIDEBAR_CLASSES } from './sidebarStyles';

export interface SidebarItemProps {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    color: string;
  };
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  to,
  icon: Icon,
  badge,
  isCollapsed = false,
  isActive = false,
  onClick,
}) => {
  if (isCollapsed) {
    return (
      <div className="relative group px-2">
        <NavLink
          to={to}
          onClick={onClick}
          className={`${SIDEBAR_CLASSES.railButton} ${
            isActive ? SIDEBAR_CLASSES.railButtonActive : SIDEBAR_CLASSES.railButtonInactive
          }`}
          aria-label={label}
        >
          <Icon className="w-4 h-4" />
        </NavLink>

        {/* Hover Tooltip when collapsed */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded bg-[#1a1d2e] border border-slate-700/80 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <NavLink
        to={to}
        onClick={onClick}
        className={`${SIDEBAR_CLASSES.navLink} ${
          isActive ? SIDEBAR_CLASSES.navLinkActive : SIDEBAR_CLASSES.navLinkInactive
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </div>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </NavLink>
    </div>
  );
};

export default SidebarItem;
