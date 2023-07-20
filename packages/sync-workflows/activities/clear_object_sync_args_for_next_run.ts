import type { SyncService } from '../services/sync_service';

export type ClearObjectSyncArgsForNextRunArgs = {
  objectSyncId: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClearObjectSyncArgsForNextRunResult = {};

export function createClearObjectSyncArgsForNextRun(syncService: SyncService) {
  return async function clearObjectSyncArgsForNextRun({
    objectSyncId,
  }: ClearObjectSyncArgsForNextRunArgs): Promise<ClearObjectSyncArgsForNextRunResult> {
    await syncService.clearArgsForNextEntitySyncRun(objectSyncId);
    return {};
  };
}
