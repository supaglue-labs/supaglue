import { Provider } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useProviders() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<Provider[]>('/api/internal/providers');

  return {
    providers: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
