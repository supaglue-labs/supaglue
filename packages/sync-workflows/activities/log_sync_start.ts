import { SyncHistoryService } from '@supaglue/core/services';

export function createLogSyncStart({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncStart({ connectionId, commonModel }: { connectionId: string; commonModel: string }) {
    return syncHistoryService.logStart({ connectionId, commonModel });
  };
}
