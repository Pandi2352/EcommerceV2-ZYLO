import React, { useState, useEffect, useCallback } from 'react';
import { toast } from '@shared/ui/Toast';
import { analyticsService } from '@shared/api/analytics.service';
import { settingsService } from '@shared/api/settings.service';
import type { DashboardSummaryResponse } from '@shared/types/analytics';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardAlertsBanner from '../components/dashboard/DashboardAlertsBanner';
import KpiStatsRow from '../components/dashboard/KpiStatsRow';
import RevenueChartCard from '../components/dashboard/RevenueChartCard';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import LowStockAlertCard from '../components/dashboard/LowStockAlertCard';
import RecentCustomersCard from '../components/dashboard/RecentCustomersCard';
import TopCategoriesCard from '../components/dashboard/TopCategoriesCard';
import FloatingSettingsButton from '../components/dashboard/FloatingSettingsButton';

export const AdminDashboardPage: React.FC = () => {
  const [range, setRange] = useState<string>('30d');
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Load Store Currency settings
  useEffect(() => {
    settingsService
      .getPublicSettings()
      .then((settings) => {
        if (settings?.currencySymbol) {
          setCurrencySymbol(settings.currencySymbol);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Dashboard Summary
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboardSummary(range);
      setData(res);
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {/* 1. Header with greeting and range selector */}
      <DashboardHeader
        range={range}
        onRangeChange={(newRange) => setRange(newRange)}
        onRefresh={fetchDashboard}
        loading={loading}
      />

      {/* 2. Operational Action Banners (Pending fulfillment & low-stock alerts) */}
      <DashboardAlertsBanner alerts={data?.alerts ?? null} loading={loading} />

      {/* 3. Top KPI Cards Row */}
      <KpiStatsRow
        kpis={data?.kpis ?? null}
        currencySymbol={currencySymbol}
        loading={loading}
      />

      {/* 4. Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side: Sales Velocity Chart & Recent Orders Table (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          <RevenueChartCard
            chartData={data?.chartData ?? []}
            currencySymbol={currencySymbol}
            loading={loading}
          />

          <RecentOrdersTable
            orders={data?.recentOrders ?? []}
            currencySymbol={currencySymbol}
            loading={loading}
          />
        </div>

        {/* Right Side: Low Stock Warnings, Recent Customers & Top Categories (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          <LowStockAlertCard
            products={data?.alerts?.lowStockProducts ?? []}
            outOfStockCount={data?.alerts?.outOfStockCount ?? 0}
            currencySymbol={currencySymbol}
            loading={loading}
          />

          <RecentCustomersCard
            customers={data?.recentCustomers ?? []}
            currencySymbol={currencySymbol}
            loading={loading}
          />

          <TopCategoriesCard
            categories={data?.topCategories ?? []}
            loading={loading}
          />
        </div>
      </div>

      {/* Floating Settings Button */}
      <FloatingSettingsButton />
    </div>
  );
};

export default AdminDashboardPage;
