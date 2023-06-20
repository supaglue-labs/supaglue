import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { ConnectionService, SyncHistoryService } from '@supaglue/core/services';
import { SyncHistoryStatus } from '@supaglue/types/sync_history';
import { ApplicationService } from '../services';

export function createLogSyncFinish({
  syncHistoryService,
  connectionService,
  applicationService,
}: {
  syncHistoryService: SyncHistoryService;
  connectionService: ConnectionService;
  applicationService: ApplicationService;
}) {
  return async function logSyncFinish({
    syncId,
    connectionId,
    historyId,
    status,
    errorMessage,
    errorStack,
    numRecordsSynced,
  }: {
    syncId: string;
    connectionId: string;
    historyId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
    errorStack?: string;
    numRecordsSynced: number | null;
  }) {
    await syncHistoryService.logFinish({ historyId, status, errorMessage, numRecordsSynced });
    if (status === 'FAILURE') {
      const error = new Error(errorMessage);
      error.stack = errorStack;
      logger.error(error, `Sync failed for syncId ${syncId} and connectionId ${connectionId}`);
    }

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);
    posthogClient.capture({
      distinctId: distinctId ?? application.orgId,
      event: `Completed Sync`,
      properties: {
        result: status === 'FAILURE' ? 'error' : 'success',
        params: {
          syncId,
          connectionId,
          historyId,
          errorMessage,
          providerName: connection.providerName,
        },
        source: 'sync-workflows',
        system: getSystemProperties(),
      },
    });
  };
}
