import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import StackedBar from '@shared/charts/StackedBar';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface HierarchyDepthCardProps {
  data: CategoryOverviewData;
}

/** Visualizes how categories are distributed across hierarchy depth (Root, Sub, Leaf) */
export const HierarchyDepthCard: React.FC<HierarchyDepthCardProps> = ({ data }) => {
  const segments = data.levelDistribution.map((lvl) => ({
    key: `level-${lvl.level}`,
    label: lvl.label,
    value: lvl.count,
    color: lvl.color,
    to: '/categories',
  }));

  const total = data.summary.total;

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="How are categories distributed across hierarchy levels?"
      subtitle={`${total} categories organized up to 3 depth levels`}
      table={
        <ChartTable
          columns={['Level', 'Categories', 'Ratio']}
          rows={data.levelDistribution.map((lvl) => [
            lvl.label,
            lvl.count,
            `${total ? Math.round((lvl.count / total) * 100) : 0}%`,
          ])}
        />
      }
    >
      {total === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-500">No categories recorded yet.</p>
      ) : (
        <div className="space-y-4">
          <StackedBar
            segments={segments}
            ariaLabel={`Hierarchy breakdown: ${segments.map((s) => `${s.value} in ${s.label}`).join(', ')}`}
          />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {data.levelDistribution.map((lvl) => (
              <div key={lvl.level} className="p-2 rounded bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-700">{lvl.count}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                  Level {lvl.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default HierarchyDepthCard;
