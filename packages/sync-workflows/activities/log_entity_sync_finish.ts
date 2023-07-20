import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { getSystemProperties, posthogClient } from '@supaglue/core/lib/posthog';
import type { ConnectionService } from '@supaglue/core/services';
import type { EntitySyncRunService } from '@supaglue/core/services/entity_sync_run_service';
import type { EntitySyncRunStatus } from '@supaglue/types/entity_sync_run';
import type { ApplicationService } from '../services';

export function createLogEntitySyncFinish({
  entitySyncRunService,
  connectionService,
  applicationService,
}: {
  entitySyncRunService: EntitySyncRunService;
  connectionService: ConnectionService;
  applicationService: ApplicationService;
}) {
  return async function logEntitySyncFinish({
    entitySyncId,
    connectionId,
    runId,
    status,
    errorMessage,
    errorStack,
    numRecordsSynced,
  }: {
    entitySyncId: string;
    connectionId: string;
    runId: string;
    status: EntitySyncRunStatus;
    errorMessage?: string;
    errorStack?: string;
    numRecordsSynced: number | null;
  }) {
    await entitySyncRunService.logFinish({ runId, status, errorMessage, numRecordsSynced });

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    if (status === 'FAILURE') {
      const error = new Error(errorMessage);
      error.stack = errorStack;

      if (application.environment === 'development') {
        logger.warn(error, `Sync failed for entitySyncId ${entitySyncId} and connectionId ${connectionId}`);
      } else {
        logger.error(error, `Sync failed for entitySyncId ${entitySyncId} and connectionId ${connectionId}`);
      }
    }

    posthogClient.capture({
      distinctId: distinctId ?? application.orgId,
      event: `Completed Sync`,
      properties: {
        result: status === 'FAILURE' ? 'error' : 'success',
        params: {
          entitySyncId,
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
