import { camelcaseKeys } from '@/utils/camelcase';
import { Integration } from '@supaglue/core/types';
import useSWR from 'swr';
import { fetcher } from '.';

export function useIntegration(integrationId: string) {
  const { data, error, isLoading, ...rest } = useSWR(
    `/api/internal/integrations/${integrationId}`,
    fetcher<Integration>
  );

  return {
    integration: data ? camelcaseKeys(data) : undefined,
    isLoading,
    isError: error,
    ...rest,
  };
}
