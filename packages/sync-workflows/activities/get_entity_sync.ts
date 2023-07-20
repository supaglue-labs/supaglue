import type { EntitySync } from '@supaglue/types/entity_sync';
import type { SyncService } from '../services/sync_service';

export type GetEntitySyncArgs = {
  entitySyncId: string;
};

export type GetEntitySyncResult = {
  entitySync: EntitySync;
};

export function createGetEntitySync(syncService: SyncService) {
  return async function getEntitySync({ entitySyncId }: GetEntitySyncArgs): Promise<GetEntitySyncResult> {
    const entitySync = await syncService.getEntitySyncById(entitySyncId);
    return {
      entitySync,
    };
  };
}
