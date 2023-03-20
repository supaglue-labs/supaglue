import { camelcaseKeys } from '@/utils/camelcase';
import { Integration } from '@supaglue/core/types';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegrations() {
  const { data, error, isLoading, ...rest } = useSWR(`/api/internal/integrations`, fetcher<Integration[]>);

  return {
    integrations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
