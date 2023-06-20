import { Sync } from '@supaglue/types';
import { SyncService } from '../services/sync_service';

export type SetForceSyncFlagResult = {
  sync: Sync;
};

export function createSetForceSyncFlag(syncService: SyncService) {
  return async function setForceSyncFlag(
    { syncId }: { syncId: string },
    flag: boolean
  ): Promise<SetForceSyncFlagResult> {
    const sync = await syncService.setForceSyncFlag({ syncId }, flag);
    return { sync };
  };
}
