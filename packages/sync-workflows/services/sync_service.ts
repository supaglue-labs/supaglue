import { logger } from '@supaglue/core/lib';
import { ConnectionService, SyncConfigService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import { ObjectSync as ObjectSyncModel, PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  getRunManagedSyncScheduleId,
  getRunManagedSyncWorkflowId,
  runManagedSync,
} from '@supaglue/sync-workflows/workflows/run_managed_sync';
import { ConnectionSafeAny, Sync, SyncState, SyncType } from '@supaglue/types';
import { ObjectSync, ObjectSyncState, ObjectType } from '@supaglue/types/object_sync';
import {
  Client,
  IntervalSpec,
  ScheduleAlreadyRunning,
  ScheduleNotFoundError,
  ScheduleOptionsAction,
  WorkflowNotFoundError,
} from '@temporalio/client';
import { getRunObjectSyncScheduleId, getRunObjectSyncWorkflowId, runObjectSync } from '../workflows/run_object_sync';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function fromObjectSyncModel(model: ObjectSyncModel): ObjectSync {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: SyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    objectType: model.objectType as ObjectType,
    object: model.object,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as SyncState,
    forceSyncFlag: model.forceSyncFlag,
    paused: model.paused,
  } as ObjectSync;
}

function fromSyncModel(model: SyncModel): Sync {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: SyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as SyncState,
    forceSyncFlag: model.forceSyncFlag,
    paused: model.paused,
    schemaMappingsConfig: model.schemaMappingsConfig,
  } as Sync;
}

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #connectionService: ConnectionService;
  #syncConfigService: SyncConfigService;

  public constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    connectionService: ConnectionService,
    syncConfigService: SyncConfigService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
    this.#syncConfigService = syncConfigService;
  }

  public async getObjectSyncById(id: string): Promise<ObjectSync> {
    const model = await this.#prisma.objectSync.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return fromObjectSyncModel(model);
  }

  public async updateObjectSyncState(id: string, state: ObjectSyncState): Promise<ObjectSync> {
    // TODO: We should be doing type-checking
    const model = await this.#prisma.objectSync.update({
      where: {
        id,
      },
      data: {
        state,
      },
    });
    return fromObjectSyncModel(model);
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
    // Get all the SyncConfigChange objects
    const syncConfigChanges = await this.#prisma.syncConfigChange.findMany({
      select: {
        id: true,
        syncConfigId: true,
      },
    });
    const syncConfigChangeIds = syncConfigChanges.map((syncConfigChange) => syncConfigChange.id);

    // Find out all the sync_configs that may have changed
    const uniqueSyncConfigIds = [
      ...new Set(syncConfigChanges.map((syncConfigChange) => syncConfigChange.syncConfigId)),
    ];

    // Get all the associated syncs and generate sync changes so that we update the schedule intervals.
    // TODO: Write a raw query instead of reading out all syncs and then writing sync changes.
    const syncsForSyncConfigs = await this.#prisma.sync.findMany({
      where: {
        syncConfigId: {
          in: uniqueSyncConfigIds,
        },
      },
      select: {
        id: true,
      },
    });

    const objectSyncsForSyncConfigs = await this.#prisma.objectSync.findMany({
      where: {
        syncConfigId: {
          in: uniqueSyncConfigIds,
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
      ...new Set([
        ...syncsForSyncConfigs.map((sync) => sync.id),
        ...syncChanges.map((syncChange) => syncChange.syncId),
      ]),
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
        syncConfigId: true,
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

    // Get all the ObjectSyncChange objects
    const objectSyncChanges = await this.#prisma.objectSyncChange.findMany();
    const objectSyncChangeIds = objectSyncChanges.map((objectSyncChange) => objectSyncChange.id);

    // Find out all the object syncs that may have changed (for now, it's just created; syncs aren't updated).
    const uniqueObjectSyncIds = [
      ...new Set([
        ...objectSyncsForSyncConfigs.map((objectSync) => objectSync.id),
        ...objectSyncChanges.map((objectSyncChange) => objectSyncChange.objectSyncId),
      ]),
    ];
    const objectSyncs = await this.#prisma.objectSync.findMany({
      where: {
        id: {
          in: uniqueObjectSyncIds,
        },
      },
      select: {
        id: true,
        connectionId: true,
        syncConfigId: true,
      },
    });

    // Classify ObjectSyncChange into upserts and deletes
    const objectSyncIdsToDelete = uniqueObjectSyncIds.filter(
      (objectSyncId) => !objectSyncs.some((objectSync) => objectSync.id === objectSyncId)
    );
    const objectSyncsToUpsert = uniqueObjectSyncIds.flatMap((objectSyncId) => {
      if (objectSyncIdsToDelete.includes(objectSyncId)) {
        return [];
      }
      const objectSync = objectSyncs.find((objectSync) => objectSync.id === objectSyncId);
      return objectSync ? [objectSync] : [];
    });
    const objectSyncIdsToUpsert = objectSyncsToUpsert.map((objectSync) => objectSync.id);

    // Delete syncs
    await this.#deleteTemporalSyncs(syncIdsToDelete);

    // Upsert syncs

    // Delete object syncs
    await this.#deleteTemporalObjectSyncs(objectSyncIdsToDelete);

    // Upsert object syncs

    // Get the sync configs
    const syncConfigIds: string[] = [
      ...syncs
        .filter((sync) => syncIdsToUpsert.includes(sync.id))
        .flatMap((sync) => (sync.syncConfigId ? [sync.syncConfigId] : [])),
      ...objectSyncs
        .filter((objectSync) => objectSyncIdsToUpsert.includes(objectSync.id))
        .flatMap((objectSync) => (objectSync.syncConfigId ? [objectSync.syncConfigId] : [])),
    ];
    const syncConfigs = await this.#syncConfigService.listByIds(syncConfigIds);

    // Get the connections
    const connectionIds = [
      ...syncs.filter((sync) => syncIdsToUpsert.includes(sync.id)).map((sync) => sync.connectionId),
      ...objectSyncs
        .filter((objectSync) => objectSyncIdsToUpsert.includes(objectSync.id))
        .map((objectSync) => objectSync.connectionId),
    ];
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // Upsert schedules for all the syncs
    for (const sync of syncsToUpsert) {
      const connection = connections.find((connection) => connection.id === sync.connectionId);
      if (!connection) {
        throw new Error('Unexpected error: connection not found');
      }

      const syncConfig = syncConfigs.find((syncConfig) => syncConfig.id === sync.syncConfigId);
      if (!syncConfig) {
        throw new Error('Unexpected error: syncConfig not found');
      }

      await this.upsertTemporalSync(
        sync.id,
        connection,
        syncConfig.config.defaultConfig.periodMs ?? FIFTEEN_MINUTES_MS
      );
    }

    // Upsert schedules for all the object syncs
    for (const objectSync of objectSyncsToUpsert) {
      const connection = connections.find((connection) => connection.id === objectSync.connectionId);
      if (!connection) {
        throw new Error('Unexpected error: connection not found');
      }

      const syncConfig = syncConfigs.find((syncConfig) => syncConfig.id === objectSync.syncConfigId);
      if (!syncConfig) {
        throw new Error('Unexpected error: syncConfig not found');
      }

      await this.upsertTemporalObjectSync(
        objectSync.id,
        connection,
        syncConfig.config.defaultConfig.periodMs ?? FIFTEEN_MINUTES_MS
      );
    }

    await Promise.all([
      // Delete the SyncConfigChange objects
      this.#prisma.syncConfigChange.deleteMany({
        where: {
          id: {
            in: syncConfigChangeIds,
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
      // Delete the ObjectSyncChange objects
      this.#prisma.objectSyncChange.deleteMany({
        where: {
          id: {
            in: objectSyncChangeIds,
          },
        },
      }),
    ]);
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

  async upsertTemporalSync(syncId: string, connection: ConnectionSafeAny, syncPeriodMs: number): Promise<void> {
    const sync = await this.getSyncById(syncId);
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
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_ID]: connection.providerId,
            [TEMPORAL_CONTEXT_ARGS.SYNC_CONFIG_ID]: sync.syncConfigId,
            [TEMPORAL_CONTEXT_ARGS.CONNECTION_ID]: sync.connectionId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_ID]: [connection.providerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_CONFIG_ID]: [sync.syncConfigId],
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

  async #deleteTemporalObjectSyncs(objectSyncIds: string[]): Promise<void> {
    // TODO: When we stop using temporalite locally, we should just use
    // advanced visibility to search by custom attributes and find the workflows to kill.
    // When temporalite is on Temporal Server 1.20.0, it should be able to do advanced visibility
    // in Postgres and without an external ES cluster.
    //
    // Right now, we can't just use `getRunSyncWorkflowId` because when the schedule
    // starts up the workflow, it appends a timestamp suffix to the workflow ID.

    // Get the object sync schedule handles
    const objectSyncScheduleHandles = objectSyncIds.map((objectSyncId) =>
      this.#temporalClient.schedule.getHandle(getRunObjectSyncScheduleId(objectSyncId))
    );

    try {
      // Pause the sync schedules
      await Promise.all(objectSyncScheduleHandles.map((handle) => handle.pause()));

      // Kill the associated workflows
      const scheduleDescriptions = await Promise.all(objectSyncScheduleHandles.map((handle) => handle.describe()));
      const workflowIds = scheduleDescriptions.flatMap((description) =>
        description.info.runningActions.map((action) => action.workflow.workflowId)
      );
      const workflowHandles = workflowIds.map((workflowId) => this.#temporalClient.workflow.getHandle(workflowId));
      await Promise.all(workflowHandles.map((handle) => handle.terminate()));

      // Kill the sync schedules
      await Promise.all(objectSyncScheduleHandles.map((handle) => handle.delete()));
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

  async upsertTemporalObjectSync(
    objectSyncId: string,
    connection: ConnectionSafeAny,
    syncPeriodMs: number
  ): Promise<void> {
    const objectSync = await this.getObjectSyncById(objectSyncId);
    const scheduleId = getRunObjectSyncScheduleId(objectSyncId);
    const interval: IntervalSpec = {
      every: syncPeriodMs,
      // so that not everybody is refreshing and hammering the DB at the same time
      offset: 0,
      // offset: Math.random() * syncPeriodMs, // TODO: Let's make the offset the same per object?
    };
    const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
      type: 'startWorkflow' as const,
      workflowType: runObjectSync,
      workflowId: getRunObjectSyncWorkflowId(objectSyncId),
      taskQueue: SYNC_TASK_QUEUE,
      args: [
        {
          objectSyncId,
          connectionId: connection.id,
          category: connection.category,
          context: {
            // TODO: should be OBJECT_SYNC_ID
            [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: objectSyncId,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
            [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_ID]: connection.providerId,
            [TEMPORAL_CONTEXT_ARGS.SYNC_CONFIG_ID]: objectSync.syncConfigId,
            [TEMPORAL_CONTEXT_ARGS.CONNECTION_ID]: objectSync.connectionId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        // TODO: should be OBJECT_SYNC_ID
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [objectSyncId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_ID]: [connection.providerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_CONFIG_ID]: [objectSync.syncConfigId],
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
