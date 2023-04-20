import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { SyncHistoryService } from '@supaglue/core/services';
import { SyncHistoryStatus } from '@supaglue/types/sync_history';

export function createLogSyncFinish({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncFinish({
    syncId,
    connectionId,
    historyId,
    status,
    errorMessage,
    errorStack,
  }: {
    syncId: string;
    connectionId: string;
    historyId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
    errorStack?: string;
  }) {
    await syncHistoryService.logFinish({ historyId, status, errorMessage });
    if (status === 'FAILURE') {
      const error = new Error(errorMessage);
      error.stack = errorStack;
      logger.error(error, `Sync failed for syncId ${syncId} and connectionId ${connectionId}`);
    }

    if (!distinctId) {
      return;
    }
    posthogClient.capture({
      distinctId,
      event: `Sync ${status}`,
      properties: {
        result: status === 'FAILURE' ? 'success' : 'error',
        params: {
          syncId,
          connectionId,
          historyId,
          errorMessage,
        },
        source: 'sync-workflows',
        system: getSystemProperties(),
      },
    });
  };
}
