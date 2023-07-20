import type { ObjectSync } from '@supaglue/types/object_sync';
import type { SyncService } from '../services/sync_service';

export type GetObjectSyncArgs = {
  objectSyncId: string;
};

export type GetObjectSyncResult = {
  objectSync: ObjectSync;
};

export function createGetObjectSync(syncService: SyncService) {
  return async function getObjectSync({ objectSyncId }: GetObjectSyncArgs): Promise<GetObjectSyncResult> {
    const objectSync = await syncService.getObjectSyncById(objectSyncId);
    return {
      objectSync,
    };
  };
}
