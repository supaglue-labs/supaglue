import type { SyncFilterParams } from '@/utils/filter';
import { snakecase } from '@/utils/snakecase';
import type { PaginatedResult } from '@supaglue/types';
import type { SyncRun } from '@supaglue/types/sync_run';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export const SYNC_RUNS_PAGE_SIZE = 100;

export function useSyncRuns(cursor?: string, filterParams?: SyncFilterParams[]) {
  const queryParams = new URLSearchParams();
  queryParams.append('page_size', SYNC_RUNS_PAGE_SIZE.toString());
  filterParams?.forEach(({ filterBy, value }) => {
    queryParams.append(snakecase(filterBy), value);
  });
  cursor && queryParams.append('cursor', cursor);

  const { data, isLoading, error } = useSWRWithApplication(`/api/internal/sync-runs?${queryParams}`);

  return {
    syncRuns: data ? (camelcaseKeys(data) as PaginatedResult<SyncRun>) : undefined,
    isLoading,
    error,
  };
}
