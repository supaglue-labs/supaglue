import type { GetSyncConfigResponse } from '@supaglue/schemas/v2/mgmt';
import type { SyncConfig } from '@supaglue/types';
import type { CommonObjectConfig } from '@supaglue/types/sync_object_config';
import { camelcaseKeys } from '@supaglue/utils';
import { useSWRWithApplication } from './useSWRWithApplication';

export function useSyncConfig(syncConfigId: string) {
  const { data, isLoading, error, ...rest } = useSWRWithApplication<GetSyncConfigResponse>(
    `/api/internal/sync-configs/${syncConfigId}`
  );

  return {
    syncConfig: data ? toSyncConfig(data) : undefined,
    isLoading,
    error,
    ...rest,
  };
}

export const toSyncConfig = (response: GetSyncConfigResponse): SyncConfig => {
  const camelcased = camelcaseKeys(response);
  return {
    ...camelcased,
    config: {
      ...camelcased.config,
      commonObjects: camelcased.config.commonObjects as CommonObjectConfig[],
    },
  };
};
