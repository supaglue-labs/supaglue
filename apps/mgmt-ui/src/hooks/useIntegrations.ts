import useSWR from 'swr';
import { API_HOST, fetcher } from '.';

export function useIntegrations() {
  const { data, error, isLoading } = useSWR(`${API_HOST}/mgmt/v1/integrations`, fetcher);

  return {
    integrations: data,
    isLoading,
    isError: error,
  };
}
