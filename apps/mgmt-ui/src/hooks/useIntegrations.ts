import { API_HOST } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegrations() {
  const { data, error, isLoading, ...rest } = useSWR(`${API_HOST}/internal/v1/integrations`, fetcher);

  return {
    integrations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
