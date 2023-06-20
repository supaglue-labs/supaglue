import { Integration } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
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
