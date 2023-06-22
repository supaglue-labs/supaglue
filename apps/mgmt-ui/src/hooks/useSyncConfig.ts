import { CreateSyncConfigRequest, GetSyncConfigResponse, UpdateSyncConfigRequest } from '@supaglue/schemas/v2/mgmt';
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

export const toCreateSyncConfigRequest = (syncConfig: Omit<SyncConfig, 'id'>): CreateSyncConfigRequest => {
  return snakecaseKeys(syncConfig);
};

export const toUpdateSyncConfigRequest = (syncConfig: SyncConfig): UpdateSyncConfigRequest => {
  return snakecaseKeys(syncConfig);
};
