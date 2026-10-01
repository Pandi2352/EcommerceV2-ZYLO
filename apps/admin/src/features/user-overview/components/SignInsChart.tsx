import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import LineChart from '@shared/charts/LineChart';
import type { UserManagementOverview } from '../../../services/userOverview.service';

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Daily admin-portal sign-ins: successful vs failed (failed includes wrong 2FA codes). */
export const SignInsChart: React.FC<{ data: UserManagementOverview }> = ({ data }) => {
  const { series, success, failed, blocked } = data.signIns;
  const labels = series.map((d) => d.date);

  return (
    <ChartCard
      className="lg:col-span-2"
      title="How many staff sign-ins succeed vs fail each day?"
      subtitle={`Last ${data.days} days · ${success} successful · ${failed} failed · ${blocked} blocked by lockout (UTC days)`}
      table={
        <ChartTable
          columns={['Day', 'Successful', 'Failed']}
          rows={[...series].reverse().map((d) => [dayLabel(d.date), d.success, d.failed])}
        />
      }
    >
      <LineChart
        ariaLabel={`Staff sign-ins per day over the last ${data.days} days: ${success} successful and ${failed} failed`}
        labels={labels}
        formatLabel={dayLabel}
        series={[
          { key: 'success', label: 'Successful', color: 'var(--viz-1)', values: series.map((d) => d.success) },
          { key: 'failed', label: 'Failed', color: 'var(--viz-2)', values: series.map((d) => d.failed) },
        ]}
      />
    </ChartCard>
  );
};

export default SignInsChart;
