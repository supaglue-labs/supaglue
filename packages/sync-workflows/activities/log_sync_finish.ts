import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import type { ConnectionService } from '@supaglue/core/services';
import type { SyncRunService } from '@supaglue/core/services/sync_run_service';
import type { SyncRunStatus } from '@supaglue/types/sync_run';
import type { ApplicationService } from '../services';

export function createLogSyncFinish({
  syncRunService,
  connectionService,
  applicationService,
}: {
  syncRunService: SyncRunService;
  connectionService: ConnectionService;
  applicationService: ApplicationService;
}) {
  return async function logSyncFinish({
    syncId,
    connectionId,
    runId,
    status,
    errorMessage,
    errorStack,
    numRecordsSynced,
  }: {
    syncId: string;
    connectionId: string;
    runId: string;
    status: SyncRunStatus;
    errorMessage?: string;
    errorStack?: string;
    numRecordsSynced: number | null;
  }) {
    await syncRunService.logFinish({ runId, status, errorMessage, numRecordsSynced });

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    if (status === 'FAILURE') {
      const error = new Error(errorMessage);
      error.stack = errorStack;

      if (application.environment === 'development') {
        logger.warn({ err: error }, `Sync failed for syncId ${syncId} and connectionId ${connectionId}`);
      } else {
        logger.error({ err: error }, `Sync failed for syncId ${syncId} and connectionId ${connectionId}`);
      }
    }

    posthogClient.capture({
      distinctId: distinctId ?? application.orgId,
      event: `Completed Sync`,
      properties: {
        result: status === 'FAILURE' ? 'error' : 'success',
        params: {
          syncId,
          connectionId,
          runId,
          errorMessage,
          providerName: connection.providerName,
        },
        source: 'sync-workflows',
        system: getSystemProperties(),
      },
    });
  };
}
