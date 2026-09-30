import { useState } from 'react';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import { auditService } from '../services/audit.service';
import AuditLogFilters, { type AuditFilters } from '../features/audit/components/AuditLogFilters';
import { auditLogColumns } from '../features/audit/components/auditLogColumns';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';

const PAGE_SIZE = 20;

/** Security audit trail: sign-ins, lockouts, password and two-factor changes (ADMIN+). */
export default function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [page, setPage] = useState(1);

  const logs = useApiQuery(
    () => auditService.list({ ...filters, page, limit: PAGE_SIZE }),
    [filters.event, filters.email, filters.portal, page],
  );

  const applyFilters = (next: AuditFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sign-in attempts and account security changes, with IP address and device. Kept for 180 days.
        </p>
      </div>

      <AuditLogFilters value={filters} onChange={applyFilters} />

      <DataTable
        columns={auditLogColumns}
        rows={logs.data?.items ?? null}
        rowKey={(row) => row.id}
        isLoading={logs.isLoading}
        error={logs.error?.message}
        onRetry={logs.reload}
        emptyMessage="No events match these filters."
      />

      {logs.data && logs.data.meta.total > 0 && (
        <Pagination meta={logs.data.meta} onPageChange={setPage} disabled={logs.isLoading} />
      )}
    </div>
  );
}
