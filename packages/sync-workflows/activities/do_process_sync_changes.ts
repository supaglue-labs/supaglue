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
    await systemSettingsService.setProcessSyncChangesFull(false);
    return {};
  };
}
