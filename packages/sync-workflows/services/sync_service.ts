import { logger } from '@supaglue/core/lib';
import { fromSyncConfigModel } from '@supaglue/core/mappers';
import { fromSyncModel } from '@supaglue/core/mappers/sync';
import type { ConnectionService, SyncConfigService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import type { PrismaClient } from '@supaglue/db';
import { CONNECTIONS_TABLE, Prisma, SYNCS_TABLE, SYNC_CHANGES_TABLE } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import type { ConnectionSafeAny } from '@supaglue/types';
import type { Sync, SyncState } from '@supaglue/types/sync';
import type { Client, IntervalSpec, ScheduleDescription, ScheduleOptionsAction } from '@temporalio/client';
import { ScheduleAlreadyRunning, ScheduleNotFoundError, WorkflowNotFoundError } from '@temporalio/client';
import type { ApplicationService } from '.';
import { getRunObjectSyncScheduleId, getRunObjectSyncWorkflowId, runObjectSync } from '../workflows/run_object_sync';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

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

  public async clearArgsForNextSyncRun(id: string): Promise<void> {
    await this.#prisma.sync.update({
      where: {
        id,
      },
      data: {
        argsForNextRun: Prisma.DbNull,
      },
    });
  }

  /**
   * Keep Temporal in sync with the DB.
   *
   * @param full If specified, don't just consider the syncs that have change events.
   * Instead, consider all SyncConfig + SyncConfig state in the DB and make sure
   * Temporal is in sync with that. You may want to set this to 'true' when:
   * - you add a new Temporal search attribute and you want to backfill for existing
   *   schedules, or
   * - you manually tampered with the state in Temporal (e.g. you deleted or paused a
   *   schedule), and you want to re-sync the Temporal state with that of the DB.
   *
   * TODO: When `full=true`, we currently do not attempt to delete all orphaned Temporal
   * schedules. We should do that.
   */
  public async processSyncChanges(full?: boolean): Promise<void> {
    // This is broken into two parts
    // Part 1 - Process all the SyncConfigChange events and see if we need to
    //          create/update/delete any Syncs (and SyncChanges)
    // Part 2 - Process all the SyncChange events and see if we need to
    //          create/update/delete any Temporal schedules/workflows
    await this.#processSyncConfigChanges(full);
    await this.#processSyncChanges(full);
  }

  async #processSyncConfigChanges(full?: boolean): Promise<void> {
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
    const syncConfigModels = full
      ? await this.#prisma.syncConfig.findMany()
      : await this.#prisma.syncConfig.findMany({
          where: {
            id: {
              in: uniqueSyncConfigIds,
            },
          },
        });

    // Insert / delete Syncs
    for (const syncConfigModel of syncConfigModels) {
      const syncConfig = fromSyncConfigModel(syncConfigModel);
      const autoStart = syncConfig.config.defaultConfig.autoStartOnConnection ?? true;
      const relevantConnections = await this.#connectionService.getSafeByProviderId(syncConfig.providerId);

      const syncArgs: Prisma.SyncCreateManyInput[] = [];

      for (const connection of relevantConnections) {
        if (syncConfig.config.commonObjects?.length) {
          for (const commonObject of syncConfig.config.commonObjects) {
            syncArgs.push({
              type: 'object',
              objectType: 'common',
              object: commonObject.object,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              paused: !autoStart,
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
            syncArgs.push({
              type: 'object',
              objectType: 'standard',
              object: standardObject.object,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              paused: !autoStart,
              strategy: {
                type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
              },
              state: {
                phase: 'created',
              },
            });
          }
        }

        if (syncConfig.config.entities?.length) {
          for (const entity of syncConfig.config.entities) {
            syncArgs.push({
              type: 'entity',
              entityId: entity.entityId,
              connectionId: connection.id,
              syncConfigId: syncConfig.id,
              paused: !autoStart,
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
        // Create Syncs and ignore duplicates
        if (syncArgs.length) {
          await tx.sync.createMany({
            data: syncArgs,
            skipDuplicates: true,
          });
        }

        // Create SyncChanges
        // The field names here reference `object_sync_id` because we didn't migrate the actual column
        // names in the DB when we merged Object and Entity Syncs.
        await tx.$executeRawUnsafe(`INSERT INTO ${SYNC_CHANGES_TABLE} (id, object_sync_id)
SELECT gen_random_uuid(), s.id
FROM ${SYNCS_TABLE} s
JOIN ${CONNECTIONS_TABLE} c on s.connection_id = c.id
WHERE c.provider_id = '${syncConfig.providerId}'`);

        // Delete Syncs
        await tx.sync.deleteMany({
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
                      type: 'object',
                      objectType: 'common',
                      object: commonObject.object,
                    })) ?? []),
                    ...(syncConfig.config.standardObjects?.map((standardObject) => ({
                      type: 'object',
                      objectType: 'standard',
                      object: standardObject.object,
                    })) ?? []),
                    ...(syncConfig.config.entities?.map((entity) => ({
                      type: 'entity',
                      entityId: entity.entityId,
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

  async #processSyncChanges(full?: boolean): Promise<void> {
    // TODO: Page over the SyncChanges in case there are too many in one iteration.

    // Get all the SyncChange objects
    const syncChanges = await this.#prisma.syncChange.findMany();
    const syncChangeIds = syncChanges.map((syncChange) => syncChange.id);
    const uniqueSyncIds = [...new Set([...syncChanges.map((syncChange) => syncChange.syncId)])];
    const syncs = full
      ? await this.#prisma.sync.findMany()
      : await this.#prisma.sync.findMany({
          where: {
            id: {
              in: uniqueSyncIds,
            },
          },
        });

    const connectionIds = syncs.map(({ connectionId }) => connectionId);
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    const syncConfigIds = syncs.map(({ syncConfigId }) => syncConfigId);
    const syncConfigs = await this.#syncConfigService.getByIds(syncConfigIds);

    // Classify SyncChange into upserts and deletes
    const syncIdsToDelete = uniqueSyncIds.filter((syncId) => !syncs.some((sync) => sync.id === syncId));
    const syncsToUpsert = (full ? syncs.map((sync) => sync.id) : uniqueSyncIds).flatMap((syncId) => {
      if (syncIdsToDelete.includes(syncId)) {
        return [];
      }
      const sync = syncs.find((sync) => sync.id === syncId);
      return sync ? [sync] : [];
    });

    // Delete object syncs
    await this.#deleteTemporalSyncs(syncIdsToDelete);

    // Upsert schedules for all the object syncs
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
        fromSyncModel(sync),
        connection,
        syncConfig.config.defaultConfig.periodMs ?? FIFTEEN_MINUTES_MS
      );
    }

    // Delete the ObjectSyncChange objects
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

    // Get the object sync schedule handles
    const syncScheduleHandles = syncIds.map((syncId) =>
      this.#temporalClient.schedule.getHandle(getRunObjectSyncScheduleId(syncId))
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
    for (const handle of syncScheduleHandles) {
      try {
        await handle.pause();
      } catch (err: unknown) {
        errHandler(err);
      }
    }

    // Kill the associated workflows
    const scheduleDescriptions = (
      await Promise.all(
        syncScheduleHandles.map(async (handle) => {
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
    for (const handle of syncScheduleHandles) {
      try {
        await handle.delete();
      } catch (err: unknown) {
        errHandler(err);
      }
    }
  }

  async upsertTemporalSync(sync: Sync, connection: ConnectionSafeAny, syncPeriodMs: number): Promise<void> {
    const application = await this.#applicationService.getById(connection.applicationId);
    const scheduleId = getRunObjectSyncScheduleId(sync.id);
    const interval: IntervalSpec = {
      every: syncPeriodMs,
      // so that not everybody is refreshing and hammering the DB at the same time
      // we want all Syncs for the same connection to have the same offset, and it should be deterministic,
      // so that if we have Syncs 1 and 2 running, and then later 3 is created (due to SyncConfig having another
      // object added), then 3 will have the same offset as 1 and 2
      offset: stringToNumber(connection.id, syncPeriodMs),
    };

    const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
      type: 'startWorkflow' as const,
      workflowType: runObjectSync,
      workflowId: getRunObjectSyncWorkflowId(sync.id),
      taskQueue: SYNC_TASK_QUEUE,
      args: [
        {
          syncId: sync.id,
          connectionId: connection.id,
          category: connection.category,
          context: {
            [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: sync.id,
            [TEMPORAL_CONTEXT_ARGS.SYNC_TYPE]: sync.type,
            [TEMPORAL_CONTEXT_ARGS.OBJECT_TYPE]: 'objectType' in sync ? sync.objectType : '',
            [TEMPORAL_CONTEXT_ARGS.OBJECT_NAME]: 'object' in sync ? sync.object : '',
            [TEMPORAL_CONTEXT_ARGS.ENTITY_ID]: 'entityId' in sync ? sync.entityId : '',
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
            [TEMPORAL_CONTEXT_ARGS.APPLICATION_ENV]: application.environment,
            [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
            [TEMPORAL_CONTEXT_ARGS.CONNECTION_ID]: sync.connectionId,
            [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
          },
        },
      ],
      searchAttributes: {
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [sync.id],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_TYPE]: [sync.type],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.OBJECT_TYPE]: 'objectType' in sync ? [sync.objectType] : [],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.OBJECT_NAME]: 'object' in sync ? [sync.object] : [],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.ENTITY_ID]: 'entityId' in sync ? [sync.entityId] : [],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ENV]: [application.environment],
        [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
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
          triggerImmediately: !sync.paused,
          paused: sync.paused,
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
            state: {
              ...prev.state,
              paused: sync.paused,
            },
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
