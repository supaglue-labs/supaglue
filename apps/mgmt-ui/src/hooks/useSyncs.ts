import type { SyncFilterParams } from '@/utils/filter';
import { snakecase } from '@/utils/snakecase';
import type { PaginatedResult } from '@supaglue/types';
import type { SyncDTO } from '@supaglue/types/sync';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export const SYNCS_PAGE_SIZE = 10;

export function useSyncs(cursor?: string, filterParams?: SyncFilterParams) {
  const queryParams = new URLSearchParams();
  queryParams.append('page_size', SYNCS_PAGE_SIZE.toString());
  if (filterParams) {
    queryParams.append(snakecase(filterParams.filterBy), filterParams.value);
  }
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
