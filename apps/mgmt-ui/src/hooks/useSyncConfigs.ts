import { SyncConfig } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncConfigs() {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<SyncConfig[]>('/api/internal/sync-configs');

  return {
    syncConfigs: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
