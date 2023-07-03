import { logger } from '@supaglue/core/lib';
import { fromSyncConfigModel } from '@supaglue/core/mappers';
import type { ConnectionService, SyncConfigService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import type { ObjectSync as ObjectSyncModel, Prisma, PrismaClient } from '@supaglue/db';
import { CONNECTIONS_TABLE, OBJECT_SYNCS_TABLE, OBJECT_SYNC_CHANGES_TABLE } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import type { ConnectionSafeAny } from '@supaglue/types';
import type { ObjectSync, ObjectSyncState, ObjectSyncType, ObjectType } from '@supaglue/types/object_sync';
import type { Client, IntervalSpec, ScheduleDescription, ScheduleOptionsAction } from '@temporalio/client';
import { ScheduleAlreadyRunning, ScheduleNotFoundError, WorkflowNotFoundError } from '@temporalio/client';
import type { ApplicationService } from '.';
import { getRunObjectSyncScheduleId, getRunObjectSyncWorkflowId, runObjectSync } from '../workflows/run_object_sync';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function fromObjectSyncModel(model: ObjectSyncModel): ObjectSync {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: ObjectSyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    objectType: model.objectType as ObjectType,
    object: model.object,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as ObjectSyncState,
    paused: model.paused,
  } as ObjectSync;
}

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #connectionService: ConnectionService;
  #syncConfigService: SyncConfigService;
  #applicationService: ApplicationService;

  public constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    connectionService: ConnectionService,
    syncConfigService: SyncConfigService,
    applicationService: ApplicationService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
    this.#syncConfigService = syncConfigService;
    this.#applicationService = applicationService;
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
    // TODO: Page over the SyncConfigChanges in case there are too many in one iteration.

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
            AND: [
              {
                connection: {
                  providerId: syncConfig.providerId,
                },
              },
              {
                NOT: {
                  OR: [
                    ...(syncConfig.config.commonObjects?.map((commonObject) => ({
                      objectType: 'common',
                      object: commonObject.object,
                    })) ?? []),
                    ...(syncConfig.config.standardObjects?.map((standardObject) => ({
                      objectType: 'standard',
                      object: standardObject.object,
                    })) ?? []),
                    ...(syncConfig.config.customObjects?.map((customObject) => ({
                      objectType: 'custom',
                      object: customObject.object,
                    })) ?? []),
                  ],
                },
              },
            ],
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
    // TODO: Page over the ObjectSyncChanges in case there are too many in one iteration.

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

    function errHandler(err: unknown) {
      if (err instanceof ScheduleNotFoundError) {
        logger.warn({ scheduleId: err.scheduleId }, 'Schedule not found when deleting. Ignoring for idempotency...');
      } else if (err instanceof WorkflowNotFoundError) {
        logger.warn({ workflowId: err.workflowId }, 'Workflow not found when deleting. Ignoring for idempotency...');
      } else {
        throw err;
      }
    }

    // Pause the sync schedules
    for (const handle of objectSyncScheduleHandles) {
      try {
        await handle.pause();
      } catch (err: unknown) {
        errHandler(err);
      }
    }

    // Kill the associated workflows
    const scheduleDescriptions = (
      await Promise.all(
        objectSyncScheduleHandles.map(async (handle) => {
          let description: ScheduleDescription | undefined = undefined;

          try {
            description = await handle.describe();
          } catch (err: unknown) {
            errHandler(err);
          }

          return description;
        })
      )
    ).filter<ScheduleDescription>((description): description is ScheduleDescription => !!description);

    const workflowIds = scheduleDescriptions.flatMap((description) =>
      description.info.runningActions.map((action) => action.workflow.workflowId)
    );
    const workflowHandles = workflowIds.map((workflowId) => this.#temporalClient.workflow.getHandle(workflowId));

    for (const handle of workflowHandles) {
      try {
        await handle.terminate();
      } catch (err: unknown) {
        errHandler(err);
      }
    }

    // Kill the sync schedules
    for (const handle of objectSyncScheduleHandles) {
      try {
        await handle.delete();
      } catch (err: unknown) {
        errHandler(err);
      }
    }
  }

  async upsertTemporalObjectSync(
    objectSyncId: string,
    connection: ConnectionSafeAny,
    syncPeriodMs: number
  ): Promise<void> {
    const objectSync = await this.getObjectSyncById(objectSyncId);
    const application = await this.#applicationService.getById(connection.applicationId);
    const scheduleId = getRunObjectSyncScheduleId(objectSyncId);
    const interval: IntervalSpec = {
      every: syncPeriodMs,
      // so that not everybody is refreshing and hammering the DB at the same time
      // we want all ObjectSyncs for the same connection to have the same offset, and it should be deterministic,
      // so that if we have ObjectSyncs 1 and 2 running, and then later 3 is created (due to SyncConfig having another
      // object added), then 3 will have the same offset as 1 and 2
      offset: stringToNumber(connection.id, syncPeriodMs),
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
            [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: objectSyncId,
            [TEMPORAL_CONTEXT_ARGS.OBJECT_TYPE]: objectSync.objectType,
            [TEMPORAL_CONTEXT_ARGS.OBJECT_NAME]: objectSync.object,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ENV]: application.environment,
            [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_ID]: connection.providerId,
            [TEMPORAL_CONTEXT_ARGS.SYNC_CONFIG_ID]: objectSync.syncConfigId,
            [TEMPORAL_CONTEXT_ARGS.CONNECTION_ID]: objectSync.connectionId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [objectSyncId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.OBJECT_TYPE]: [objectSync.objectType],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.OBJECT_NAME]: [objectSync.object],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ENV]: [application.environment],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_ID]: [connection.providerId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_CONFIG_ID]: [objectSync.syncConfigId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
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

function stringToNumber(str: string, maxNumExclusive: number): number {
  if (str.length === 0) {
    return 0;
  }

  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // convert to 32bit integer
  }

  return Math.abs(hash) % maxNumExclusive;
}
