import type { SyncService } from '../services/sync_service';

export type ClearSyncArgsForNextRunArgs = {
  syncId: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClearSyncArgsForNextRunResult = {};

export function createClearSyncArgsForNextRun(syncService: SyncService) {
  return async function clearSyncArgsForNextRun({
    syncId,
  }: ClearSyncArgsForNextRunArgs): Promise<ClearSyncArgsForNextRunResult> {
    await syncService.clearArgsForNextSyncRun(syncId);
    return {};
  };
}
