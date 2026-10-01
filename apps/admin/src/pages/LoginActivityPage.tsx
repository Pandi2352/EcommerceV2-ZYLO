import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users } from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import { ROUTES } from '../routes/routePaths';
import { LOGIN_ACTIVITY_PAGE_SIZES, useLoginActivity } from '../features/login-activity/hooks/useLoginActivity';
import { useLoginActivityActions } from '../features/login-activity/hooks/useLoginActivityActions';
import { loginActivityColumns } from '../features/login-activity/components/loginActivityColumns';
import LoginActivityToolbar from '../features/login-activity/components/LoginActivityToolbar';

/** Console sign-in events: who signed in or failed, from which IP and device. */
export const LoginActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const state = useLoginActivity();
  const actions = useLoginActivityActions(state.reload);
  const { stats } = state;

  const columns = useMemo(
    () => loginActivityColumns({ onCopyIp: actions.copyIp, onRevokeSessions: actions.askRevokeSessions }),
    [actions.copyIp, actions.askRevokeSessions],
  );

  const filtered = state.hasFilters || state.status !== 'all';
  const emptyState = filtered ? (
    <EmptyState
      icon={<Activity />}
      title="No sign-in events match"
      description="Nothing in this period or tab matches your search. Clear the filters to see every event."
      action={
        <Button size="sm" variant="outline" onClick={state.resetAll}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<Activity />}
      title="No sign-in events yet"
      description="Events appear here as soon as a staff member signs in or out of the console."
    />
  );

  return (
    <div>
      <PageHeader
        title="Login activity"
        count={state.total}
        description={
          <>
            Console sign-ins, failures, lockouts and sign-outs with IP and device.
            {stats && (
              <span className="tabular-nums">
                {' '}
                Today: {stats.totalAttempts} events, {stats.successCount} successful, {stats.failedCount} failed or blocked,{' '}
                {stats.uniqueStaffCount} staff signed in.
              </span>
            )}
          </>
        }
        actions={
          <Button size="sm" variant="outline" leftIcon={<Users />} onClick={() => navigate(ROUTES.USERS)}>
            Staff directory
          </Button>
        }
      />

      <LoginActivityToolbar state={state} />

      <DataTable
        columns={columns}
        rows={state.items}
        rowKey={(r) => r.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        emptyState={emptyState}
        skeletonRows={10}
        footer={
          state.total !== undefined && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.total}
              onPageChange={state.setPage}
              onPageSizeChange={state.setPageSize}
              pageSizeOptions={LOGIN_ACTIVITY_PAGE_SIZES}
              disabled={state.isLoading}
              itemLabel="events"
            />
          )
        }
      />

      {actions.dialog}
    </div>
  );
};

export default LoginActivityPage;
