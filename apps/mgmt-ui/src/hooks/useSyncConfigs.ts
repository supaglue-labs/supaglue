import type { GetSyncConfigsResponse } from '@supaglue/schemas/v2/mgmt';
import type { SyncConfig } from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';
import { toSyncConfig } from './useSyncConfig';

export function useSyncConfigs() {
  const { data, isLoading, error, ...rest } =
    useSWRWithApplication<GetSyncConfigsResponse>('/api/internal/sync-configs');

  return {
    syncConfigs: data ? data.map(toSyncConfig) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toGetSyncConfigsResponse = (syncConfigs: SyncConfig[]): GetSyncConfigsResponse => {
  return syncConfigs.map(snakecaseKeys);
};
