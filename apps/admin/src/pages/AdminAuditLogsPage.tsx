import { ShieldCheck } from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import AuditLogFilters from '../features/audit/components/AuditLogFilters';
import { auditLogColumns } from '../features/audit/components/auditLogColumns';
import { AUDIT_PAGE_SIZES, useAuditLogs } from '../features/audit/hooks/useAuditLogs';

/** Security audit trail: sign-ins, lockouts, password and two-factor changes (ADMIN+). */
export default function AdminAuditLogsPage() {
  const state = useAuditLogs();

  const emptyState = state.hasFilters ? (
    <EmptyState
      icon={<ShieldCheck />}
      title="No events match these filters"
      description="Try another event or portal, or clear the filters to see the full log."
      action={<Button size="sm" variant="outline" onClick={state.clearFilters}>Clear filters</Button>}
    />
  ) : (
    <EmptyState
      icon={<ShieldCheck />}
      title="No security events yet"
      description="Sign-ins and account security changes are recorded here as they happen."
    />
  );

  return (
    <div>
      <PageHeader
        title="Security logs"
        count={state.meta?.total}
        description="Sign-in attempts and account security changes, with IP address and device. Kept for 180 days."
      />

      <AuditLogFilters state={state} />

      <DataTable
        columns={auditLogColumns}
        rows={state.items}
        rowKey={(row) => row.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        emptyState={emptyState}
        skeletonRows={10}
        footer={
          state.meta && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.meta.total}
              onPageChange={state.setPage}
              onPageSizeChange={state.setPageSize}
              pageSizeOptions={AUDIT_PAGE_SIZES}
              disabled={state.isLoading}
              itemLabel="events"
            />
          )
        }
      />
    </div>
  );
}
