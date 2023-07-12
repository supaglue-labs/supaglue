import type { SystemSettingsService } from '@supaglue/core/services/system_settings_service';
import type { SyncService } from '../services/sync_service';

// eslint-disable-next-line @typescript-eslint/ban-types
export type DoProcessSyncChangesArgs = {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type DoProcessSyncChangesResult = {};

export function createDoProcessSyncChanges(syncService: SyncService, systemSettingsService: SystemSettingsService) {
  return async function doProcessSyncChanges(args: DoProcessSyncChangesArgs): Promise<DoProcessSyncChangesResult> {
    const { processSyncChangesFull } = await systemSettingsService.getSystemSettings();
    await syncService.processSyncChanges(processSyncChangesFull);

    // Only reset the flag if it was true to begin with.
    // Because the manual trigger has an OverlapPolicy of BUFFER_ONE, if there
    // is already a run occurring, that existing run could reset this flag to false
    // even though it executed `syncService.processSyncChanges` with `full` set to true.
    if (processSyncChangesFull) {
      await systemSettingsService.setProcessSyncChangesFull(false);
    }
    return {};
  };
}
