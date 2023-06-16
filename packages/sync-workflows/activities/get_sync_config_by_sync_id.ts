import { SyncConfigService } from '@supaglue/core/services';
import { SyncConfig } from '@supaglue/types/sync_config';

import { ApplicationFailure } from '@temporalio/workflow';

export type GetSyncConfigBySyncIdArgs = {
  syncId: string;
};

export type GetSyncConfigBySyncIdResult = {
  syncConfig: SyncConfig;
};

export function createGetSyncConfigBySyncId(syncConfigService: SyncConfigService) {
  return async function getSyncConfigBySyncId({
    syncId,
  }: GetSyncConfigBySyncIdArgs): Promise<GetSyncConfigBySyncIdResult> {
    const syncConfig = await syncConfigService.getBySyncId(syncId);
    if (!syncConfig) {
      throw ApplicationFailure.nonRetryable(`Can't find syncConfig with syncId: ${syncId}`);
    }
    return { syncConfig };
  };
}
