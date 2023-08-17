import SyncRunsTable from '@/components/logs/SyncRunsTable';
import { useSyncRuns } from '@/hooks/useSyncRuns';
import Header from '@/layout/Header';
import type { SupaglueProps } from '@/pages/applications/[applicationId]';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import type { SyncRunFilterParams } from '@/utils/filter';
import { Box } from '@mui/material';
import { useState } from 'react';

export { getServerSideProps };

export default function Home(props: SupaglueProps) {
  const [currentCursor, setCurrentCursor] = useState<string | undefined>();
  const [filterParams, setFilterParams] = useState<SyncRunFilterParams[] | undefined>();
  const { syncRuns, isLoading } = useSyncRuns(currentCursor, filterParams);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNextPage = () => {
    if (syncRuns?.next) {
      setCurrentCursor(syncRuns.next);
    }
  };

  const handlePreviousPage = () => {
    if (syncRuns?.previous) {
      setCurrentCursor(syncRuns.previous);
    }
  };

  const handleFilters = (newFilterParams?: SyncRunFilterParams[]) => {
    setFilterParams(newFilterParams);
    setCurrentCursor(undefined);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Sync Runs" onDrawerToggle={handleDrawerToggle} {...props} />
      <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
        <SyncRunsTable
          handleNextPage={handleNextPage}
          handlePreviousPage={handlePreviousPage}
          handleFilters={handleFilters}
          rowCount={syncRuns?.totalCount ?? 0}
          data={syncRuns?.results ?? []}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
}
