import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import { ConnectionService } from '@supaglue/core/services';
import { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import { SyncHistoryStatus } from '@supaglue/types/sync_history';
import { ApplicationService } from '../services';

export function createLogObjectSyncFinish({
  objectSyncRunService,
  connectionService,
  applicationService,
}: {
  objectSyncRunService: ObjectSyncRunService;
  connectionService: ConnectionService;
  applicationService: ApplicationService;
}) {
  return async function logObjectSyncFinish({
    objectSyncId,
    connectionId,
    runId,
    status,
    errorMessage,
    errorStack,
    numRecordsSynced,
  }: {
    objectSyncId: string;
    connectionId: string;
    runId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
    errorStack?: string;
    numRecordsSynced: number | null;
  }) {
    await objectSyncRunService.logFinish({ runId, status, errorMessage, numRecordsSynced });

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    if (status === 'FAILURE') {
      const error = new Error(errorMessage);
      error.stack = errorStack;

      if (application.environment === 'development') {
        logger.warn(error, `Sync failed for objectSyncId ${objectSyncId} and connectionId ${connectionId}`);
      } else {
        logger.error(error, `Sync failed for objectSyncId ${objectSyncId} and connectionId ${connectionId}`);
      }
    }

    posthogClient.capture({
      distinctId: distinctId ?? application.orgId,
      event: `Completed Sync`,
      properties: {
        result: status === 'FAILURE' ? 'error' : 'success',
        params: {
          objectSyncId,
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
