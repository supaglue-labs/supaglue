import { logger } from '@supaglue/core/lib';
import { ConnectionService, IntegrationService } from '@supaglue/core/services';
import { TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import { PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { getRunSyncScheduleId, getRunSyncWorkflowId, runSync } from '@supaglue/sync-workflows/workflows/run_sync';
import { ConnectionSafe, Sync, SyncState, SyncType } from '@supaglue/types';
import { Client, ScheduleAlreadyRunning, ScheduleNotFoundError, WorkflowNotFoundError } from '@temporalio/client';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function fromSyncModel(model: SyncModel): Sync {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: SyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    type,
    ...otherStrategyProps,
    state: model.state as SyncState,
  } as Sync;
}

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #connectionService: ConnectionService;
  #integrationService: IntegrationService;

  public constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    connectionService: ConnectionService,
    integrationService: IntegrationService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
    this.#integrationService = integrationService;
  }

  public async getSyncById(id: string): Promise<Sync> {
    const model = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return fromSyncModel(model);
  }

  public async updateSyncState(id: string, state: SyncState): Promise<Sync> {
    // TODO: We should be doing type-checking
    const model = await this.#prisma.sync.update({
      where: {
        id,
      },
      data: {
        state,
      },
    });
    return fromSyncModel(model);
  }

  public async processSyncChanges(): Promise<void> {
    // Get all the SyncChange objects
    const syncChanges = await this.#prisma.syncChange.findMany();
    const syncChangeIds = syncChanges.map((syncChange) => syncChange.id);

    // Find out all the syncs that may have changed (for now, it's just created; syncs aren't updated).
    const uniqueSyncIds = [...new Set(syncChanges.map((syncChange) => syncChange.syncId))];
    const syncs = await this.#prisma.sync.findMany({
      where: {
        id: {
          in: uniqueSyncIds,
        },
      },
      select: {
        id: true,
        connectionId: true,
      },
    });

    // Classify SyncChange into upserts and deletes
    const syncIdsToDelete = uniqueSyncIds.filter((syncId) =>
      syncChanges.some((syncChange) => syncChange.syncId === syncId)
    );
    const syncIdsToUpsert = uniqueSyncIds.filter((syncId) => !syncIdsToDelete.includes(syncId));

    // Delete syncs
    await this.#deleteTemporalSyncs(syncIdsToDelete);

    // Upsert syncs

    // Get the connections
    const connectionIds = syncs.filter((sync) => syncIdsToUpsert.includes(sync.id)).map((sync) => sync.connectionId);
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // Get the integrations
    const integrationIds = connections.map((connection) => connection.integrationId);
    const integrations = await this.#integrationService.getByIds(integrationIds);

    // Upsert schedules for all the syncs (currently ignores updating periodMs)
    await Promise.all(
      syncIdsToUpsert.map((syncId) => {
        const sync = syncs.find((sync) => sync.id === syncId);
        if (!sync) {
          throw new Error('Unexpected error: sync not found');
        }
        const connection = connections.find((connection) => connection.id === sync.connectionId);
        if (!connection) {
          throw new Error('Unexpected error: connection not found');
        }
        const integration = integrations.find((integration) => integration.id === connection.integrationId);
        if (!integration) {
          throw new Error('Unexpected error: integration not found');
        }
        return this.#createTemporalSyncIfNotExist(
          syncId,
          connection,
          integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS
        );
      })
    );

    // Delete the SyncChange objects
    await this.#prisma.syncChange.deleteMany({
      where: {
        id: {
          in: syncChangeIds,
        },
      },
    });
  }

  async #deleteTemporalSyncs(syncIds: string[]): Promise<void> {
    // TODO: When we stop using temporalite locally, we should just use
    // advanced visibility to search by custom attributes and find the workflows to kill.
    // When temporalite is on Temporal Server 1.20.0, it should be able to do advanced visibility
    // in Postgres and without an external ES cluster.
    //
    // Right now, we can't just use `getRunSyncWorkflowId` because when the schedule
    // starts up the workflow, it appends a timestamp suffix to the workflow ID.

    // Get the sync schedule handles
    const syncScheduleHandles = syncIds.map((syncId) =>
      this.#temporalClient.schedule.getHandle(getRunSyncScheduleId(syncId))
    );

    try {
      // Pause the sync schedules
      await Promise.all(syncScheduleHandles.map((handle) => handle.pause()));

      // Kill the associated workflows
      const scheduleDescriptions = await Promise.all(syncScheduleHandles.map((handle) => handle.describe()));
      const workflowIds = scheduleDescriptions.flatMap((description) =>
        description.info.runningActions.map((action) => action.workflow.workflowId)
      );
      const workflowHandles = workflowIds.map((workflowId) => this.#temporalClient.workflow.getHandle(workflowId));
      await Promise.all(workflowHandles.map((handle) => handle.terminate()));

      // Kill the sync schedules
      await Promise.all(syncScheduleHandles.map((handle) => handle.delete()));
    } catch (err: unknown) {
      if (err instanceof ScheduleNotFoundError) {
        logger.warn({ scheduleId: err.scheduleId }, 'Schedule not found when deleting. Ignoring for idempotency...');
      } else if (err instanceof WorkflowNotFoundError) {
        logger.warn({ workflowId: err.workflowId }, 'Workflow not found when deleting. Ignoring for idempotency...');
      } else {
        throw err;
      }
    }
  }

  async #createTemporalSyncIfNotExist(syncId: string, connection: ConnectionSafe, syncPeriodMs: number): Promise<void> {
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: getRunSyncScheduleId(syncId),
        spec: {
          intervals: [
            {
              every: syncPeriodMs,
              // so that not everybody is refreshing and hammering the DB at the same time
              offset: Math.random() * syncPeriodMs,
            },
          ],
        },
        action: {
          type: 'startWorkflow',
          workflowType: runSync,
          workflowId: getRunSyncWorkflowId(syncId),
          taskQueue: SYNC_TASK_QUEUE,
          args: [{ syncId, connectionId: connection.id }],
          searchAttributes: {
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.INTEGRATION_ID]: [connection.integrationId],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_CATEGORY]: [connection.category],
            [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_NAME]: [connection.providerName],
          },
        },
        state: {
          triggerImmediately: true,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        // swallow
        // TODO: Allow updating the schedule
        return;
      }

      throw err;
    }
  }
}
