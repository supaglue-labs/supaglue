import { Integration } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useIntegration(integrationId: string) {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<Integration>(
    `/api/internal/integrations/${integrationId}`
  );

  return {
    integration: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
