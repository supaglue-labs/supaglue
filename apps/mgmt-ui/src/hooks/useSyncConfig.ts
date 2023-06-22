import { CreateSyncConfigRequest, GetSyncConfigResponse } from '@supaglue/schemas/v2/mgmt';
import { CommonObjectConfig, SyncConfig } from '@supaglue/types';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
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

// TODO: Delete once we've migrated types
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

export const toCreateSyncConfigRequest = (syncConfig: SyncConfig): CreateSyncConfigRequest => {
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
};
