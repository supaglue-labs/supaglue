import { Sync } from '@supaglue/types';
import { SyncService } from 'sync-worker/services/sync_service';

export type GetSyncArgs = {
  syncId: string;
};

export type GetSyncResult = {
  sync: Sync;
};

export function createGetSync(syncService: SyncService) {
  return async function getSync({ syncId }: GetSyncArgs): Promise<GetSyncResult> {
    throw new Error('purposely making it fail');
    const sync = await syncService.getSyncById(syncId);
    return { sync };
  };
}
