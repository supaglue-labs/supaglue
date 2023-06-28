import { logger } from '@supaglue/core/lib';
import { fromSyncConfigModel } from '@supaglue/core/mappers';
import { ConnectionService, SyncConfigService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import type { ObjectSync as ObjectSyncModel, Prisma, Sync as SyncModel } from '@supaglue/db';
import { CONNECTIONS_TABLE, OBJECT_SYNCS_TABLE, OBJECT_SYNC_CHANGES_TABLE, PrismaClient } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  getRunManagedSyncScheduleId,
  getRunManagedSyncWorkflowId,
  runManagedSync,
} from '@supaglue/sync-workflows/workflows/run_managed_sync';
import type { ConnectionSafeAny, Sync, SyncState, SyncType } from '@supaglue/types';
import type { ObjectSync, ObjectSyncState, ObjectType } from '@supaglue/types/object_sync';
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
    // This is broken into two parts
    // Part 1 - Process all the SyncConfigChange events and see if we need to
    //          create/update/delete any ObjectSyncs (and ObjectSyncChanges)
    // Part 2 - Process all the ObjectSyncChange events and see if we need to
    //          create/update/delete any Temporal schedules/workflows
    await this.#processSyncConfigChanges();
    await this.#processObjectSyncChanges();
  }

  async #processSyncConfigChanges(): Promise<void> {
    // Get all the SyncConfigChange objects
    const syncConfigChanges = await this.#prisma.syncConfigChange.findMany({
      select: {
        id: true,
        syncConfigId: true,
      },
    });
    const syncConfigChangeIds = syncConfigChanges.map(({ id }) => id);
    const uniqueSyncConfigIds = [...new Set(syncConfigChanges.map(({ syncConfigId }) => syncConfigId))];
    const syncConfigModels = await this.#prisma.syncConfig.findMany({
      where: {
        id: {
          in: uniqueSyncConfigIds,
        },
      },
    });

    // Insert / delete ObjectSyncs
    for (const syncConfigModel of syncConfigModels) {
      const syncConfig = fromSyncConfigModel(syncConfigModel);
      const relevantConnections = await this.#connectionService.getSafeByProviderId(syncConfig.providerId);

      const objectSyncArgs: Prisma.ObjectSyncCreateManyInput[] = [];
      for (const connection of relevantConnections) {
        if (syncConfig.config.commonObjects?.length) {
          for (const commonObject of syncConfig.config.commonObjects) {
            objectSyncArgs.push({
              objectType: 'common',
              object: commonObject.object,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              strategy: {
                type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
              },
              state: {
                phase: 'created',
              },
            });
          }
        }

        if (syncConfig.config.standardObjects?.length) {
          for (const standardObject of syncConfig.config.standardObjects) {
            objectSyncArgs.push({
              objectType: 'standard',
              object: standardObject.object,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              strategy: {
                type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
              },
              state: {
                phase: 'created',
              },
            });
          }
        }

        if (syncConfig.config.customObjects?.length) {
          for (const customObject of syncConfig.config.customObjects) {
            objectSyncArgs.push({
              objectType: 'custom',
              object: customObject.object,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              strategy: {
                type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
              },
              state: {
                phase: 'created',
              },
            });
          }
        }
      }

      await this.#prisma.$transaction(async (tx) => {
        // Create ObjectSyncs and ignore duplicates
        if (objectSyncArgs.length) {
          await tx.objectSync.createMany({
            data: objectSyncArgs,
            skipDuplicates: true,
          });
        }

        // Create ObjectSyncChanges
        await tx.$executeRawUnsafe(`INSERT INTO ${OBJECT_SYNC_CHANGES_TABLE} (id, object_sync_id)
SELECT gen_random_uuid(), s.id
FROM ${OBJECT_SYNCS_TABLE} s
JOIN ${CONNECTIONS_TABLE} c on s.connection_id = c.id
WHERE c.provider_id = '${syncConfig.providerId}'`);

        // Delete ObjectSyncs
        await tx.objectSync.deleteMany({
          where: {
            NOT: {
              OR: [
                ...(syncConfig.config.commonObjects?.map((commonObject) => ({
                  connection: {
                    providerId: syncConfig.providerId,
                  },
                  objectType: 'common',
                  object: commonObject.object,
                })) ?? []),
                ...(syncConfig.config.standardObjects?.map((standardObject) => ({
                  connection: {
                    providerId: syncConfig.providerId,
                  },
                  objectType: 'standard',
                  object: standardObject.object,
                })) ?? []),
                ...(syncConfig.config.customObjects?.map((customObject) => ({
                  connection: {
                    providerId: syncConfig.providerId,
                  },
                  objectType: 'custom',
                  object: customObject.object,
                })) ?? []),
              ],
            },
          },
        });
      });
    }

    // Delete the SyncConfigChange objects
    await this.#prisma.syncConfigChange.deleteMany({
      where: {
        id: {
          in: syncConfigChangeIds,
        },
      },
    });
  }

  async #processObjectSyncChanges(): Promise<void> {
    // Get all the ObjectSyncChange objects
    const objectSyncChanges = await this.#prisma.objectSyncChange.findMany();
    const objectSyncChangeIds = objectSyncChanges.map((objectSyncChange) => objectSyncChange.id);
    const uniqueObjectSyncIds = [
      ...new Set([...objectSyncChanges.map((objectSyncChange) => objectSyncChange.objectSyncId)]),
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

    const connectionIds = objectSyncs.map(({ connectionId }) => connectionId);
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    const syncConfigIds = objectSyncs.map(({ syncConfigId }) => syncConfigId);
    const syncConfigs = await this.#syncConfigService.getByIds(syncConfigIds);

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

    // Delete object syncs
    await this.#deleteTemporalObjectSyncs(objectSyncIdsToDelete);

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

    // Delete the ObjectSyncChange objects
    await this.#prisma.objectSyncChange.deleteMany({
      where: {
        id: {
          in: objectSyncChangeIds,
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
