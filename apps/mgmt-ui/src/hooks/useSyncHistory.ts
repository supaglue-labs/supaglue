import { camelcaseKeys } from '@/utils/camelcase';
import { SyncHistory } from '@supaglue/core/types';
import useSWR from 'swr';
import { fetcher } from '.';

export function useSyncHistory() {
  const { data, error, isLoading } = useSWR(`/api/internal/sync-history`, fetcher<SyncHistory[]>);

  return {
    syncHistories: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
