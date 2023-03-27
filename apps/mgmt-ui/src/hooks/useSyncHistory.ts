import { camelcaseKeys } from '@supaglue/core/lib/camelcase';
import { PaginatedResult, SyncHistory } from '@supaglue/core/types';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncHistory() {
  const { data, isLoading, error } = useSWRWithApplication('/api/internal/sync-history');

  return {
    syncHistories: data ? (camelcaseKeys(data) as PaginatedResult<SyncHistory>) : undefined,
    isLoading,
    error,
  };
}
