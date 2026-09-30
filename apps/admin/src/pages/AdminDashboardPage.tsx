import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KpiStatsRow from '../components/dashboard/KpiStatsRow';
import RevenueChartCard from '../components/dashboard/RevenueChartCard';
import SalesByLocationCard from '../components/dashboard/SalesByLocationCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import TopCategoriesCard from '../components/dashboard/TopCategoriesCard';
import FloatingSettingsButton from '../components/dashboard/FloatingSettingsButton';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Header with greeting and date picker */}
      <DashboardHeader />

      {/* 2. Top KPI Cards Row */}
      <KpiStatsRow />

      {/* 3. Main Dashboard Grid Layout matching uploaded screenshot */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Revenue Chart & Sales by Locations (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          <RevenueChartCard />
          <SalesByLocationCard />
        </div>

        {/* Right Side: Recent Activity & Top 10 Categories (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          <RecentActivityCard />
          <TopCategoriesCard />
        </div>
      </div>

      {/* Floating Gear Action Button */}
      <FloatingSettingsButton />
    </div>
  );
};

export default AdminDashboardPage;
