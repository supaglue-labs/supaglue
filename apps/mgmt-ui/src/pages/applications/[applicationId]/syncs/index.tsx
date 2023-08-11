import SyncsTable from '@/components/logs/SyncsTable';
import { useSyncs } from '@/hooks/useSyncs';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import type { SyncFilterParams } from '@/utils/filter';
import { Box } from '@mui/material';
import { useState } from 'react';

export { getServerSideProps };

export default function Home() {
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [filterParams, setFilterParams] = useState<SyncFilterParams[] | undefined>();
  const { syncs, isLoading, mutate } = useSyncs(currentCursor, filterParams);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNextPage = () => {
    if (syncs?.next) {
      setCurrentCursor(syncs.next);
    }
  };

  const handlePreviousPage = () => {
    if (syncs?.previous) {
      setCurrentCursor(syncs.previous);
    }
  };

  const handleFilters = (newFilterParams?: SyncFilterParams[]) => {
    setFilterParams(newFilterParams);
    setCurrentCursor(undefined);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Syncs" onDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
        <SyncsTable
          handleNextPage={handleNextPage}
          handlePreviousPage={handlePreviousPage}
          handleFilters={handleFilters}
          rowCount={syncs?.totalCount ?? 0}
          data={syncs?.results ?? []}
          isLoading={isLoading}
          mutate={mutate}
        />
      </Box>
    </Box>
  );
}
