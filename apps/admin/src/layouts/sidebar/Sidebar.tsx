import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import {
  SIDEBAR_CLASSES,
  SIDEBAR_DIMENSIONS,
  ADMIN_NAV_SECTIONS,
} from './sidebarStyles';
import type { NavSectionConfig, NavGroupConfig } from './sidebarStyles';
import SidebarGroup from './SidebarGroup';
import SidebarFooter from './SidebarFooter';

export interface SidebarProps {
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}
export type { NavSectionConfig, NavGroupConfig };

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onCloseMobile,
}) => {
  const location = useLocation();

  // Accordion open states in expanded view (catalog open by default)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    catalog: true,
  });

  // Active flyout state in collapsed mode
  const [activeFlyout, setActiveFlyout] = useState<{
    group: NavGroupConfig;
    top: number;
  } | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMouseEnterGroup = (
    group: NavGroupConfig,
    e: React.MouseEvent<HTMLElement>
  ) => {
    if (!isCollapsed) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const flyoutEstimatedHeight = (group.pages.length + 1) * 36 + 60;
    const maxTop = window.innerHeight - flyoutEstimatedHeight - 20;
    const computedTop = Math.max(64, Math.min(rect.top, maxTop));

    setActiveFlyout({ group, top: computedTop });
  };

  const handleMouseLeaveGroup = () => {
    if (!isCollapsed) return;
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleFlyoutMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null);
    }, 180);
  };

  return (
    <aside
      className={`${SIDEBAR_CLASSES.aside} ${
        isCollapsed ? SIDEBAR_DIMENSIONS.collapsedWidth : SIDEBAR_DIMENSIONS.expandedWidth
      }`}
    >
      {/* Brand Header */}
      <div className={SIDEBAR_CLASSES.header}>
        <Link
          to={ROUTES.DASHBOARD}
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 mx-auto lg:mx-0 cursor-pointer overflow-hidden"
        >
          {/* Cyan / Turquoise Loop Icon matching screenshot */}
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-900 font-black shrink-0">
            <svg
              className="w-4 h-4 text-[#1e222d]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>

          {/* Logo Text (hidden when collapsed) */}
          {!isCollapsed && (
            <span className="font-black text-base tracking-wider text-white">
              VELZON
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Groups Container */}
      <div className="flex-1 py-3 overflow-y-auto space-y-3.5 custom-scrollbar-dark">
        {ADMIN_NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.title} className="space-y-0.5">
            {/* Section Title */}
            {!isCollapsed ? (
              <p className={SIDEBAR_CLASSES.sectionTitle}>{section.title}</p>
            ) : sIdx > 0 ? (
              <div className="py-1 flex justify-center">
                <MoreHorizontal className="w-3 h-3 text-slate-600" />
              </div>
            ) : null}

            {/* Module Rows */}
            {section.items.map((group) => (
              <SidebarGroup
                key={group.id}
                id={group.id}
                label={group.label}
                icon={group.icon}
                pages={group.pages}
                badge={group.badge}
                isCollapsed={isCollapsed}
                isOpen={Boolean(openGroups[group.id])}
                onToggleOpen={() => toggleGroup(group.id)}
                onMouseEnter={(e) => handleMouseEnterGroup(group, e)}
                onMouseLeave={handleMouseLeaveGroup}
                onPageClick={onCloseMobile}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <SidebarFooter isCollapsed={isCollapsed} />

      {/* Collapsed Mode Flyout Popover */}
      {isCollapsed && activeFlyout && (
        <div
          className={SIDEBAR_CLASSES.flyoutContainer}
          style={{ top: activeFlyout.top }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          {/* Flyout Header */}
          <div className={SIDEBAR_CLASSES.flyoutHeader}>
            <span className="text-[12.5px] font-bold text-white tracking-wide">
              {activeFlyout.group.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Flyout Submenu Links */}
          <div className="py-1.5 px-2 space-y-0.5">
            {activeFlyout.group.pages.map((sub) => {
              const isActive =
                location.pathname === sub.to ||
                (sub.to === ROUTES.DASHBOARD && location.pathname === '/');

              return (
                <Link
                  key={sub.to}
                  to={sub.to}
                  onClick={() => {
                    setActiveFlyout(null);
                    onCloseMobile?.();
                  }}
                  className={`${SIDEBAR_CLASSES.flyoutLink} ${
                    isActive ? SIDEBAR_CLASSES.flyoutLinkActive : SIDEBAR_CLASSES.flyoutLinkInactive
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sub.label}</span>
                    {sub.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${sub.badge.color}`}>
                        {sub.badge.text}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
