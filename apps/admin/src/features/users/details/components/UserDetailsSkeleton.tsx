import React from 'react';

/** Placeholder matching the profile header + tabs + details card while the user loads. */
export const UserDetailsSkeleton: React.FC = () => (
  <div aria-busy="true" aria-label="Loading user">
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="skeleton h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-48" />
        <div className="skeleton h-3 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
    </div>
    <div className="mb-4 flex gap-4 border-b border-zinc-200 pb-2">
      {[64, 88, 60].map((w) => (
        <div key={w} className="skeleton h-4" style={{ width: w }} />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton h-3.5" style={{ width: `${40 + ((i * 17) % 35)}%` }} />
        </div>
      ))}
    </div>
  </div>
);

export default UserDetailsSkeleton;
