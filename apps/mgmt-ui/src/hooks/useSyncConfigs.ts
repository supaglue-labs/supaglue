import { GetSyncConfigsResponse } from '@supaglue/schemas/v2/mgmt';
import { SyncConfig } from '@supaglue/types';
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
  return syncConfigs.map((syncConfig) => {
    const snakecased = snakecaseKeys(syncConfig);
    return {
      ...snakecased,
      config: {
        default_config: snakecased.config.default_config,
        common_objects: snakecased.config.common_objects,
        standard_objects: snakecased.config.raw_objects,
        custom_objects: snakecased.config.raw_custom_objects,
      },
    };
  });
};
