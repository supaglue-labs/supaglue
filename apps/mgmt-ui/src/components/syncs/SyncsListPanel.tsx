import { TabPanel } from '@/components/TabPanel';
import { useSyncs } from '@/hooks/useSyncs';
import type { SyncFilterParams } from '@/utils/filter';
import { useState } from 'react';
import SyncsTable from '../logs/SyncsTable';

export default function SyncsListPanel() {
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [filterParams, setFilterParams] = useState<SyncFilterParams[] | undefined>();
  const { syncs, isLoading, mutate } = useSyncs(currentCursor, filterParams);

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
    <TabPanel value={0} index={0} className="w-full">
      <SyncsTable
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        handleFilters={handleFilters}
        rowCount={syncs?.totalCount ?? 0}
        data={syncs?.results ?? []}
        isLoading={isLoading}
        mutate={mutate}
      />
    </TabPanel>
  );
}
