import type { ObjectSync } from '@supaglue/types/object_sync';
import { SyncService } from '../services/sync_service';

export type GetObjectSyncArgs = {
  objectSyncId: string;
};

export type GetObjectSyncResult = {
  objectSync: ObjectSync;
};

export function createGetObjectSyncInfo(syncService: SyncService) {
  return async function getObjectSyncInfo({ objectSyncId }: GetObjectSyncArgs): Promise<GetObjectSyncResult> {
    const objectSync = await syncService.getObjectSyncById(objectSyncId);
    return {
      objectSync,
    };
  };
}
