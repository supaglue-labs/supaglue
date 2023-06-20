import { Provider } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useProvider(providerId: string) {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<Provider>(`/api/internal/providers/${providerId}`);

  return {
    provider: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
