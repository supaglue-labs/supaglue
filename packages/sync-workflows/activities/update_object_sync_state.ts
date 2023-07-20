import type { ObjectSync, ObjectSyncState } from '@supaglue/types/sync';
import type { SyncService } from '../services/sync_service';

export type UpdateObjectSyncStateArgs = {
  objectSyncId: string;
  state: ObjectSyncState;
};

export type UpdateObjectSyncStateResult = {
  objectSync: ObjectSync;
};

export function createUpdateObjectSyncState(syncService: SyncService) {
  return async function updateObjectSyncState({
    objectSyncId,
    state,
  }: UpdateObjectSyncStateArgs): Promise<UpdateObjectSyncStateResult> {
    const objectSync = await syncService.updateSyncState(objectSyncId, state);
    return { objectSync };
  };
}
