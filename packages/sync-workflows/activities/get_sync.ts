import type { Sync } from '@supaglue/types/sync';
import cuid from 'cuid';
import type { SyncService } from '../services/sync_service';

export type GetSyncArgs = {
  syncId: string;
};

export type GetSyncResult = {
  sync: Sync;
  runId: string;
};

export function createGetSync(syncService: SyncService) {
  return async function getSync({ syncId }: GetSyncArgs): Promise<GetSyncResult> {
    const sync = await syncService.getSyncById(syncId);
    return {
      sync,
      runId: cuid(),
    };
  };
}
