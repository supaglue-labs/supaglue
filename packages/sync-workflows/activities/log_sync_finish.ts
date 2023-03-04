import { SyncHistoryService } from '@supaglue/core/services';
import { SyncHistoryStatus } from '@supaglue/core/types/sync_history';

export function createLogSyncFinish({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncFinish({
    historyId,
    status,
    errorMessage,
  }: {
    historyId: number;
    status: SyncHistoryStatus;
    errorMessage?: string;
  }) {
    await syncHistoryService.update({
      id: historyId,
      updateParams: {
        status,
        errorMessage: errorMessage ?? null,
        endTimestamp: new Date(),
      },
    });
  };
}
