import type { GetSyncConfigsSuccessfulResponse } from '@supaglue/sdk/v2/mgmt';
import type { SyncConfigDTO } from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';
import { toSyncConfig } from './useSyncConfig';

export function useSyncConfigs() {
  const { data, isLoading, error, ...rest } =
    useSWRWithApplication<GetSyncConfigsSuccessfulResponse>('/api/internal/sync-configs');

  return {
    syncConfigs: data ? data.map(toSyncConfig) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toGetSyncConfigsResponse = (syncConfigs: SyncConfigDTO[]): GetSyncConfigsSuccessfulResponse => {
  return syncConfigs.map(snakecaseKeys);
};
