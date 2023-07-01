import type { SyncService } from '../services/sync_service';

// eslint-disable-next-line @typescript-eslint/ban-types
export type DoProcessSyncChangesArgs = {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type DoProcessSyncChangesResult = {};

export function createDoProcessSyncChanges(syncService: SyncService) {
  return async function doProcessSyncChanges(args: DoProcessSyncChangesArgs): Promise<DoProcessSyncChangesResult> {
    await syncService.processSyncChanges();
    return {};
  };
}
