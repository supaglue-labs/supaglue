import type { EntitySync, EntitySyncState } from '@supaglue/types/entity_sync';
import type { SyncService } from '../services/sync_service';

export type UpdateEntitySyncStateArgs = {
  entitySyncId: string;
  state: EntitySyncState;
};

export type UpdateEntitySyncStateResult = {
  entitySync: EntitySync;
};

export function createUpdateEntitySyncState(syncService: SyncService) {
  return async function updateEntitySyncState({
    entitySyncId,
    state,
  }: UpdateEntitySyncStateArgs): Promise<UpdateEntitySyncStateResult> {
    const entitySync = await syncService.updateEntitySyncState(entitySyncId, state);
    return { entitySync };
  };
}
