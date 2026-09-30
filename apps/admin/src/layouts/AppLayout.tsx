import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from './sidebar/Sidebar';
import { Navbar } from './navbar/Navbar';
import { SIDEBAR_DIMENSIONS } from './sidebar/sidebarStyles';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#f3f3f9] flex text-slate-800 antialiased font-sans overflow-hidden">
      {/* Desktop Sidebar (Fixed Left) */}
      <div
        className={`hidden md:flex flex-col fixed inset-y-0 z-40 transition-all duration-200 ${
          isCollapsed ? SIDEBAR_DIMENSIONS.collapsedWidth : SIDEBAR_DIMENSIONS.expandedWidth
        }`}
      >
        <Sidebar isCollapsed={isCollapsed} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#1e222d] z-50 shadow-none border-r border-slate-800">
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              isCollapsed={false}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Administrative Container with dynamic padding for sidebar */}
      <div
        className={`flex flex-col flex-1 min-w-0 h-screen transition-all duration-200 ${
          isCollapsed ? SIDEBAR_DIMENSIONS.mainPlCollapsed : SIDEBAR_DIMENSIONS.mainPlExpanded
        }`}
      >
        <Navbar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto custom-scrollbar">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
