import { GetSyncConfigResponse } from '@supaglue/schemas/v2/mgmt';
import { CommonObjectConfig, SyncConfig } from '@supaglue/types';
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
      defaultConfig: camelcased.config.defaultConfig,
      commonObjects: camelcased.config.commonObjects as CommonObjectConfig[],
      rawObjects: camelcased.config.standardObjects,
      rawCustomObjects: camelcased.config.customObjects,
    },
  };
};
