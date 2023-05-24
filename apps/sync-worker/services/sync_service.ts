import { logger } from '@supaglue/core/lib';
import { ConnectionService, IntegrationService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import { PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  getRunManagedSyncScheduleId,
  getRunManagedSyncWorkflowId,
  runManagedSync,
} from '@supaglue/sync-workflows/workflows/run_managed_sync';
import { getRunSyncScheduleId, getRunSyncWorkflowId, runSync } from '@supaglue/sync-workflows/workflows/run_sync';
import { ConnectionSafeAny, Sync, SyncState, SyncType } from '@supaglue/types';
import {
  Client,
  IntervalSpec,
  ScheduleAlreadyRunning,
  ScheduleNotFoundError,
  ScheduleOptionsAction,
  WorkflowNotFoundError,
} from '@temporalio/client';

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
    forceSyncFlag: model.forceSyncFlag,
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

  public async setForceSyncFlag({ syncId }: { syncId: string }, flag: boolean): Promise<Sync> {
    const model = await this.#prisma.sync.update({
      data: {
        forceSyncFlag: flag,
      },
      where: {
        id: syncId,
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
    // Get all the IntegrationChange objects
    const integrationChanges = await this.#prisma.integrationChange.findMany();
    const integrationChangeIds = integrationChanges.map((integrationChange) => integrationChange.id);

    // Find out all the integrations that may have changed
    const uniqueIntegrationIds = [
      ...new Set(integrationChanges.map((integrationChange) => integrationChange.integrationId)),
    ];

    // Get all the associated syncs and generate sync changes so that we update the schedule intervals.
    // TODO: Write a raw query instead of reading out all syncs and then writing sync changes.
    const syncsForIntegrations = await this.#prisma.sync.findMany({
      where: {
        connection: {
          integrationId: {
            in: uniqueIntegrationIds,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Get all the SyncChange objects
    const syncChanges = await this.#prisma.syncChange.findMany();
    const syncChangeIds = syncChanges.map((syncChange) => syncChange.id);

    // Find out all the syncs that may have changed (for now, it's just created; syncs aren't updated).
    const uniqueSyncIds = [
      ...new Set(syncsForIntegrations.map((sync) => sync.id)),
      ...new Set(syncChanges.map((syncChange) => syncChange.syncId)),
    ];
    const syncs = await this.#prisma.sync.findMany({
      where: {
        id: {
          in: uniqueSyncIds,
        },
      },
      select: {
        id: true,
        connectionId: true,
        version: true,
      },
    });

    // Classify SyncChange into upserts and deletes
    const syncIdsToDelete = uniqueSyncIds.filter((syncId) => !syncs.some((sync) => sync.id === syncId));
    const syncsToUpsert = uniqueSyncIds.flatMap((syncId) => {
      if (syncIdsToDelete.includes(syncId)) {
        return [];
      }
      const sync = syncs.find((sync) => sync.id === syncId);
      return sync ? [sync] : [];
    });
    const syncIdsToUpsert = syncsToUpsert.map((sync) => sync.id);

    // Delete syncs
    // We don't know which one was deleted, so we delete both.
    await this.#deleteTemporalSyncsV1(syncIdsToDelete);
    await this.#deleteTemporalSyncsV2(syncIdsToDelete);

    // Upsert syncs

    // Get the connections
    const connectionIds = syncs.filter((sync) => syncIdsToUpsert.includes(sync.id)).map((sync) => sync.connectionId);
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // Get the integrations
    const integrationIds = connections.map((connection) => connection.integrationId);
    const integrations = await this.#integrationService.getByIds(integrationIds);

    // Upsert schedules for all the syncs
    for (const sync of syncsToUpsert) {
      const connection = connections.find((connection) => connection.id === sync.connectionId);
      if (!connection) {
        throw new Error('Unexpected error: connection not found');
      }
      const integration = integrations.find((integration) => integration.id === connection.integrationId);
      if (!integration) {
        throw new Error('Unexpected error: integration not found');
      }

      if (sync.version === 'v1') {
        await this.#deleteTemporalSyncsV2([sync.id]);
        await this.upsertTemporalSyncV1(sync.id, connection, integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS);
      } else if (sync.version === 'v2') {
        await this.#deleteTemporalSyncsV1([sync.id]);
        await this.upsertTemporalSyncV2(sync.id, connection, integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS);
      } else {
        throw new Error(`Unexpected error: sync version not valid: ${sync.version}`);
      }
    }

    await Promise.all([
      // Delete the IntegrationChange objects
      this.#prisma.integrationChange.deleteMany({
        where: {
          id: {
            in: integrationChangeIds,
          },
        },
      }),
      // Delete the SyncChange objects
      this.#prisma.syncChange.deleteMany({
        where: {
          id: {
            in: syncChangeIds,
          },
        },
      }),
    ]);
  }

  async #deleteTemporalSyncsV1(syncIds: string[]): Promise<void> {
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

  async #deleteTemporalSyncsV2(syncIds: string[]): Promise<void> {
    // TODO: When we stop using temporalite locally, we should just use
    // advanced visibility to search by custom attributes and find the workflows to kill.
    // When temporalite is on Temporal Server 1.20.0, it should be able to do advanced visibility
    // in Postgres and without an external ES cluster.
    //
    // Right now, we can't just use `getRunSyncWorkflowId` because when the schedule
    // starts up the workflow, it appends a timestamp suffix to the workflow ID.

    // Get the sync schedule handles
    const syncScheduleHandles = syncIds.map((syncId) =>
      this.#temporalClient.schedule.getHandle(getRunManagedSyncScheduleId(syncId))
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

  async upsertTemporalSyncV1(syncId: string, connection: ConnectionSafeAny, syncPeriodMs: number): Promise<void> {
    const scheduleId = getRunSyncScheduleId(syncId);
    const interval: IntervalSpec = {
      every: syncPeriodMs,
      // so that not everybody is refreshing and hammering the DB at the same time
      offset: Math.random() * syncPeriodMs,
    };
    const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
      type: 'startWorkflow' as const,
      workflowType: runSync,
      workflowId: getRunSyncWorkflowId(syncId),
      taskQueue: SYNC_TASK_QUEUE,
      args: [
        {
          syncId,
          connectionId: connection.id,
          category: connection.category,
          context: {
            [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: syncId,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
            [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
            [TEMPORAL_CONTEXT_ARGS.INTEGRATION_ID]: connection.integrationId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.INTEGRATION_ID]: [connection.integrationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_CATEGORY]: [connection.category],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_NAME]: [connection.providerName],
      },
    };

    try {
      await this.#temporalClient.schedule.create({
        scheduleId,
        spec: {
          intervals: [interval],
        },
        action,
        state: {
          triggerImmediately: true,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        const handle = this.#temporalClient.schedule.getHandle(scheduleId);
        await handle.update((prev) => {
          const newInterval = prev.spec.intervals?.[0]?.every === syncPeriodMs ? prev.spec.intervals[0] : interval;

          return {
            ...prev,
            spec: {
              intervals: [newInterval],
            },
            action,
          };
        });

        return;
      }

      throw err;
    }
  }

  async upsertTemporalSyncV2(syncId: string, connection: ConnectionSafeAny, syncPeriodMs: number): Promise<void> {
    const scheduleId = getRunManagedSyncScheduleId(syncId);
    const interval: IntervalSpec = {
      every: syncPeriodMs,
      // so that not everybody is refreshing and hammering the DB at the same time
      offset: Math.random() * syncPeriodMs,
    };
    const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
      type: 'startWorkflow' as const,
      workflowType: runManagedSync,
      workflowId: getRunManagedSyncWorkflowId(syncId),
      taskQueue: SYNC_TASK_QUEUE,
      args: [
        {
          syncId,
          connectionId: connection.id,
          category: connection.category,
          context: {
            [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: syncId,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
            [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
            [TEMPORAL_CONTEXT_ARGS.INTEGRATION_ID]: connection.integrationId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.INTEGRATION_ID]: [connection.integrationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_CATEGORY]: [connection.category],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_NAME]: [connection.providerName],
      },
    };

    try {
      await this.#temporalClient.schedule.create({
        scheduleId,
        spec: {
          intervals: [interval],
        },
        action,
        state: {
          triggerImmediately: true,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        const handle = this.#temporalClient.schedule.getHandle(scheduleId);
        await handle.update((prev) => {
          const newInterval = prev.spec.intervals?.[0]?.every === syncPeriodMs ? prev.spec.intervals[0] : interval;

          return {
            ...prev,
            spec: {
              intervals: [newInterval],
            },
            action,
          };
        });

        return;
      }

      throw err;
    }
  }
}
