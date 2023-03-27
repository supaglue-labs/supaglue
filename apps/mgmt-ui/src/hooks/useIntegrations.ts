import { camelcaseKeys } from '@supaglue/core/lib/camelcase';
import { Integration } from '@supaglue/core/types';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useIntegrations() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<Integration[]>('/api/internal/integrations');

  return {
    integrations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
