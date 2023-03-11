import { API_HOST, APPLICATION_ID } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useSyncHistory() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/crm/v1/applications/${APPLICATION_ID}/sync-history`, fetcher);

  return {
    syncHistory: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
  };
}
