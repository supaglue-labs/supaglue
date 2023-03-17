import { camelcaseKeys } from '@/utils/camelcase';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegrations() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/integrations`, fetcher);

  return {
    integrations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
