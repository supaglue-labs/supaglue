import type { SyncService } from '../services/sync_service';

export type ClearEntitySyncArgsForNextRunArgs = {
  entitySyncId: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type ClearEntitySyncArgsForNextRunResult = {};

export function createClearEntitySyncArgsForNextRun(syncService: SyncService) {
  return async function clearSyncArgsForNextRun({
    entitySyncId,
  }: ClearEntitySyncArgsForNextRunArgs): Promise<ClearEntitySyncArgsForNextRunResult> {
    await syncService.clearArgsForNextObjectSyncRun(entitySyncId);
    return {};
  };
}
