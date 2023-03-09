import useSWR from 'swr';
import { API_HOST, fetcher } from '.';

export function useSyncHistory() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/crm/v1/sync-history`, fetcher);

  return {
    syncHistory: data,
    isLoading,
    isError: error,
  };
}
