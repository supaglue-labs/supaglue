import type { DestinationSafeAny } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useDestinations() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<DestinationSafeAny[]>('/api/internal/destinations');

  return {
    destinations: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
