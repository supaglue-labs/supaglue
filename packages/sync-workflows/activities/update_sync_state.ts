import type { Sync, SyncState } from '@supaglue/types/sync';
import type { SyncService } from '../services/sync_service';

export type UpdateSyncStateArgs = {
  syncId: string;
  state: SyncState;
};

export type UpdateSyncStateResult = {
  sync: Sync;
};

export function createUpdateSyncState(syncService: SyncService) {
  return async function updateSyncState({ syncId, state }: UpdateSyncStateArgs): Promise<UpdateSyncStateResult> {
    const sync = await syncService.updateSyncState(syncId, state);
    return { sync };
  };
}
