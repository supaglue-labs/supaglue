import type { PaginatedResult } from '@supaglue/types';
import type { SyncDTO } from '@supaglue/types/sync';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncs(cursor?: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('page_size', '100');
  cursor && queryParams.append('cursor', cursor);

  const { data, isLoading, error, mutate } = useSWRWithApplication<PaginatedResult<SyncDTO>>(
    `/api/internal/syncs?${queryParams}`,
    camelcaseKeys
  );

  return {
    syncs: data,
    isLoading,
    error,
    mutate,
  };
}
