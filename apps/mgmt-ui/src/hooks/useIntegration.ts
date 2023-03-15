import { API_HOST } from '@/client';
import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegration(integrationId: string) {
  const { data, error, isLoading, ...rest } = useSWR(`${API_HOST}/internal/v1/integrations/${integrationId}`, fetcher);

  return {
    integration: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
