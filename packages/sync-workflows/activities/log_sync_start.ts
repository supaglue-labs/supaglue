import { SyncHistoryService } from '@supaglue/core/services';

export function createLogSyncStart({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncStart({
    syncId,
    historyId,
    commonModel,
  }: {
    syncId: string;
    historyId: string;
    commonModel: string;
  }) {
    return syncHistoryService.logStart({ syncId, historyId, commonModel });
  };
}
