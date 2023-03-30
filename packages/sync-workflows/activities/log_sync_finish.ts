import { SyncHistoryService } from '@supaglue/core/services';
import { SyncHistoryStatus } from '@supaglue/types/sync_history';

export function createLogSyncFinish({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncFinish({
    historyId,
    status,
    errorMessage,
  }: {
    historyId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
  }) {
    await syncHistoryService.logFinish({ historyId, status, errorMessage });
  };
}
