import { PaginatedResult, SyncHistory } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncHistory() {
  const { data, isLoading, error } = useSWRWithApplication('/api/internal/sync-history');

  return {
    syncHistories: data ? (camelcaseKeys(data) as PaginatedResult<SyncHistory>) : undefined,
    isLoading,
    error,
  };
}
