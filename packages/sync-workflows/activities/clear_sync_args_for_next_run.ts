import type { SyncService } from '../services/sync_service';

export type ClearSyncArgsForNextRunArgs = {
  objectSyncId: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClearSyncArgsForNextRunResult = {};

export function createClearSyncArgsForNextRun(syncService: SyncService) {
  return async function clearSyncArgsForNextRun({
    objectSyncId,
  }: ClearSyncArgsForNextRunArgs): Promise<ClearSyncArgsForNextRunResult> {
    await syncService.clearArgsForNextRun(objectSyncId);
    return {};
  };
}
