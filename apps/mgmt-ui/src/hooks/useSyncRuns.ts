import type { PaginatedResult } from '@supaglue/types';
import type { SyncRun } from '@supaglue/types/sync_run';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncRuns(cursor?: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('page_size', '100');
  cursor && queryParams.append('cursor', cursor);

  const { data, isLoading, error } = useSWRWithApplication(`/api/internal/sync-runs?${queryParams}`);

  return {
    syncRuns: data ? (camelcaseKeys(data) as PaginatedResult<SyncRun>) : undefined,
    isLoading,
    error,
  };
}
