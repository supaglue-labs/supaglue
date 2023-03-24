import { camelcaseKeys } from '@supaglue/core/lib/camelcase';
import { PaginatedResult, SyncHistory } from '@supaglue/core/types';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncHistory() {
  const { data, isLoading, error } = useSWRWithApplication<PaginatedResult<SyncHistory>>('/api/internal/sync-history');

  return {
    syncHistories: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
  };
}
