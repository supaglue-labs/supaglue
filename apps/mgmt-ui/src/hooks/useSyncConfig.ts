import { SyncConfig } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncConfig(syncConfigId: string) {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<SyncConfig>(
    `/api/internal/sync-configs/${syncConfigId}`
  );

  return {
    syncconfig: data ? camelcaseKeys(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}
