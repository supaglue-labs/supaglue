import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useSyncHistory() {
  const { data, error, isLoading } = useSWR(`/api/internal/sync-history`, fetcher);

  return {
    syncHistory: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
