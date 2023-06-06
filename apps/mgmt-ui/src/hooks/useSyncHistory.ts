import { PaginatedResult, SyncHistory } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncHistory(cursor?: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('page_size', '100');
  cursor && queryParams.append('cursor', cursor);

  const { data, isLoading, error } = useSWRWithApplication(`/api/internal/sync-history?${queryParams}`);

  return {
    syncHistories: data ? (camelcaseKeys(data) as PaginatedResult<SyncHistory>) : undefined,
    isLoading,
    error,
  };
}
