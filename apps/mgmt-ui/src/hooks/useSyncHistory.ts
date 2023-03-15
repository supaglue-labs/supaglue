import { API_HOST } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useSyncHistory() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/internal/v1/sync-history`, fetcher);

  return {
    syncHistory: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
