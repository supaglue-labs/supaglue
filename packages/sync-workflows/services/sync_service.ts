import { logger } from '@supaglue/core/lib';
import { fromSyncConfigModel } from '@supaglue/core/mappers';
import { fromSyncModel } from '@supaglue/core/mappers/sync';
import type { ConnectionService, SyncConfigService, WebhookService } from '@supaglue/core/services';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import type { PrismaClient } from '@supaglue/db';
import { Prisma, SYNCS_TABLE, SYNC_CHANGES_TABLE } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import type { ConnectionSafeAny, SyncConfig, SyncStrategyConfig } from '@supaglue/types';
import type { ObjectSync, ObjectType, Sync, SyncState } from '@supaglue/types/sync';
import type { CommonObjectConfig, CustomObjectConfig, StandardObjectConfig } from '@supaglue/types/sync_object_config';
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
  #webhookService: WebhookService;

  public constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    connectionService: ConnectionService,
    syncConfigService: SyncConfigService,
    applicationService: ApplicationService,
    webhookService: WebhookService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
    this.#syncConfigService = syncConfigService;
    this.#applicationService = applicationService;
    this.#webhookService = webhookService;
  }

  public async getSyncById(id: string): Promise<Sync> {
    const model = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return fromSyncModel(model);
  }

  /**
   * NOTE: duped with connection_and_sync_service in api package. @todo: consolidate it
   */
  public async pauseSync(sync: Sync, pauseReason?: string): Promise<Sync> {
    const pausedSync = (await this.#changeSyncPausedState(sync, true)) as ObjectSync; // NOTE: only support object syncs
    const connection = await this.#connectionService.getSafeById(sync.connectionId);

    await this.#webhookService.sendMessage(
      'sync.paused',
      {
        connection_id: pausedSync.connectionId,
        customer_id: connection.customerId,
        provider_name: connection.providerName,
        type: 'object',
        object_type: pausedSync.objectType,
        object: pausedSync.object,
        pause_reason: pauseReason,
      },
      connection.applicationId
    );

    return pausedSync;
  }

  /**
   * NOTE: duped with connection_and_sync_service in api package. @todo: consolidate it
   */
  async #changeSyncPausedState(sync: Sync, pausedState: boolean): Promise<Sync> {
    if (sync.paused === pausedState) {
      return sync;
    }

    const newSync = await this.#prisma.$transaction(async (tx) => {
      const [newSync] = await Promise.all([
        tx.sync.update({
          where: {
            id: sync.id,
          },
          data: {
            paused: pausedState,
          },
        }),
        tx.syncChange.create({
          data: {
            syncId: sync.id,
          },
        }),
      ]);

      return newSync;
    });

    return fromSyncModel(newSync);
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
    // This is broken into three parts
    // Part 1 - Process all the ConnectionSyncConfigChnage events and see if
    //          we need to create/update/delete any Syncs (and SyncChanges)
    //          IMPORTANT: IT IS VERY IMPORTANT TO DO PART 1 BEFORE PART 2 BECAUSE
    //          WE DON'T WANT autoStartOnConnection from SyncConfig to have any effect
    //          on ConnectionSyncConfigs.
    // Part 2 - Process all the SyncConfigChange events
    //          and see if we need to create/update/delete any Syncs (and SyncChanges)
    // Part 3 - Process all the SyncChange events and see if we need to
    //          create/update/delete any Temporal schedules/workflows
    await this.#processConnectionSyncConfigChanges(full);
    await this.#processSyncConfigChanges(full);
    await this.#processSyncChanges(full);
  }

  #getSyncArgsHelper(
    syncConfig: SyncConfig,
    connection: ConnectionSafeAny,
    objectType: ObjectType,
    objectConfig: CommonObjectConfig | StandardObjectConfig | CustomObjectConfig
  ) {
    const autoStart = syncConfig.config.defaultConfig.autoStartOnConnection ?? true;
    return {
      type: 'object',
      objectType,
      object: objectConfig.object,
      connectionId: connection.id,
      syncConfigId: syncConfig.id,
      paused: !autoStart,
      strategy: {
        type:
          objectConfig.syncStrategyOverride?.strategy ??
          syncConfig.config.defaultConfig.strategy ??
          'full then incremental',
        fullSyncEveryNIncrementals:
          objectConfig.syncStrategyOverride?.fullSyncEveryNIncrementals ??
          syncConfig.config.defaultConfig.fullSyncEveryNIncrementals,
      },
      state: {
        phase: 'created',
      },
    };
  }

  #computeSyncCreateManyInputList(syncConfig: SyncConfig, connection: ConnectionSafeAny): Prisma.SyncCreateManyInput[] {
    const syncArgs: Prisma.SyncCreateManyInput[] = [];

    const autoStart = syncConfig.config.defaultConfig.autoStartOnConnection ?? true;

    // Common
    if (syncConfig.config.commonObjects?.length) {
      syncArgs.push(
        ...syncConfig.config.commonObjects.map((commonObject) =>
          this.#getSyncArgsHelper(syncConfig, connection, 'common', commonObject)
        )
      );
    }

    // Standard
    if (connection.connectionSyncConfig?.standardObjects?.length) {
      syncArgs.push(
        ...connection.connectionSyncConfig.standardObjects.map((standardObject) =>
          this.#getSyncArgsHelper(syncConfig, connection, 'standard', standardObject)
        )
      );
    } else if (syncConfig.config.standardObjects?.length) {
      syncArgs.push(
        ...syncConfig.config.standardObjects.map((standardObject) =>
          this.#getSyncArgsHelper(syncConfig, connection, 'standard', standardObject)
        )
      );
    }

    // Custom
    if (connection.connectionSyncConfig?.customObjects?.length) {
      syncArgs.push(
        ...connection.connectionSyncConfig.customObjects.map((customObject) =>
          this.#getSyncArgsHelper(syncConfig, connection, 'custom', customObject)
        )
      );
    } else if (syncConfig.config.customObjects?.length) {
      syncArgs.push(
        ...syncConfig.config.customObjects.map((customObject) =>
          this.#getSyncArgsHelper(syncConfig, connection, 'custom', customObject)
        )
      );
    }

    // Entity
    if (syncConfig.config.entities?.length) {
      syncArgs.push(
        ...syncConfig.config.entities.map((entity) => ({
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
        }))
      );
    }

    return syncArgs;
  }

  async #processConnectionSyncConfigChanges(full?: boolean): Promise<void> {
    // TODO: Page over the ConnectionSyncConfigChanges in case there are too many in one iteration.

    // Get all the ConnectionSyncConfigChange objects
    const connectionSyncConfigChanges = await this.#prisma.connectionSyncConfigChange.findMany({
      select: {
        id: true,
        connectionId: true,
      },
    });
    const connectionSyncConfigChangeIds = connectionSyncConfigChanges.map(({ id }) => id);
    const uniqueConnectionIds = [...new Set(connectionSyncConfigChanges.map(({ connectionId }) => connectionId))];
    const connections = full
      ? await this.#connectionService.listAllSafe()
      : await this.#connectionService.getSafeByIds(uniqueConnectionIds);

    // Get all the relevant SyncConfigs
    const providerIdsToLookup = [...new Set(connections.map((connection) => connection.providerId))];
    const relevantSyncConfigs = await this.#syncConfigService.listByProviderIds(providerIdsToLookup);

    // Create a map for lookup
    const providerIdToSyncConfig: Record<string, SyncConfig> = {};
    for (const syncConfig of relevantSyncConfigs) {
      providerIdToSyncConfig[syncConfig.providerId] = syncConfig;
    }

    // Insert / delete Syncs
    for (const connection of connections) {
      const syncConfig = providerIdToSyncConfig[connection.providerId];
      const syncArgs = this.#computeSyncCreateManyInputList(syncConfig, connection);

      // Create Syncs and ignore duplicates
      logger.info(
        {
          connectionId: connection.id,
        },
        'processConnectionSyncConfigChanges: Creating Syncs [IN PROGRESS]'
      );
      if (syncArgs.length) {
        await this.#prisma.sync.createMany({
          data: syncArgs,
          skipDuplicates: true,
        });
      }
      logger.info(
        {
          connectionId: connection.id,
        },
        'processConnectionSyncConfigChanges: Creating Syncs [DONE]'
      );

      // Create SyncChanges
      // The field names here reference `object_sync_id` because we didn't migrate the actual column
      // names in the DB when we merged Object and Entity Syncs.

      // TODO: Later, we should only create SyncChanges for the Syncs that were created above,
      // because some connections were skipped.
      logger.info(
        {
          connectionId: connection.id,
        },
        'processConnectionSyncConfigChanges: Creating SyncChanges [IN PROGRESS]'
      );
      await this.#prisma.$executeRawUnsafe(`INSERT INTO ${SYNC_CHANGES_TABLE} (id, object_sync_id)
SELECT gen_random_uuid(), s.id
FROM ${SYNCS_TABLE} s
WHERE s.connection_id = '${connection.id}'`);
      logger.info(
        {
          connectionId: connection.id,
        },
        'processConnectionSyncConfigChanges: Creating SyncChanges [DONE]'
      );

      // Delete Syncs
      logger.info(
        {
          connectionId: connection.id,
        },
        'processConnectionSyncConfigChanges: Deleting Syncs [IN PROGRESS]'
      );
      await this.#prisma.sync.deleteMany({
        where: {
          AND: [
            {
              connectionId: connection.id,
            },
            {
              NOT: {
                OR: syncArgs.map((syncArg) => ({
                  type: syncArg.type,
                  objectType: syncArg.objectType,
                  object: syncArg.object,
                })),
              },
            },
          ],
        },
      });
    }

    // Delete the ConnectionSyncConfigChange objects
    await this.#prisma.connectionSyncConfigChange.deleteMany({
      where: {
        id: {
          in: connectionSyncConfigChangeIds,
        },
      },
    });
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
      const relevantConnections = await this.#connectionService.getSafeByProviderId(syncConfig.providerId);

      for (const connection of relevantConnections) {
        const syncArgs = this.#computeSyncCreateManyInputList(syncConfig, connection);

        // Create Syncs and ignore duplicates
        logger.info(
          {
            connectionId: connection.id,
          },
          'processSyncChanges: Creating Syncs [IN PROGRESS]'
        );
        if (syncArgs.length) {
          await this.#prisma.sync.createMany({
            data: syncArgs,
            skipDuplicates: true,
          });
        }
        logger.info({ connectionId: connection.id }, 'processSyncChanges: Creating Syncs [DONE]');

        // Create SyncChanges
        // The field names here reference `object_sync_id` because we didn't migrate the actual column
        // names in the DB when we merged Object and Entity Syncs.

        // TODO: Later, we should only create SyncChanges for the Syncs that were created above,
        // because some connections were skipped.
        logger.info(
          {
            connectionId: connection.id,
          },
          'processSyncChanges: Creating SyncChanges [IN PROGRESS]'
        );
        await this.#prisma.$executeRawUnsafe(`INSERT INTO ${SYNC_CHANGES_TABLE} (id, object_sync_id)
SELECT gen_random_uuid(), s.id
FROM ${SYNCS_TABLE} s
WHERE s.connection_id = '${connection.id}'`);
        logger.info({ connectionId: connection.id }, 'processSyncChanges: Creating SyncChanges [DONE]');

        // Delete Syncs
        logger.info('processSyncChanges: Deleting Syncs [IN PROGRESS]');
        await this.#prisma.sync.deleteMany({
          where: {
            AND: [
              {
                connectionId: connection.id,
              },
              {
                NOT: {
                  OR: syncArgs.map((syncArg) => ({
                    type: syncArg.type,
                    objectType: syncArg.objectType,
                    object: syncArg.object,
                  })),
                },
              },
            ],
          },
        });
        logger.info({ connectionId: connection.id }, 'processSyncChanges: Deleting Syncs [DONE]');
      }
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

  // @todo: move this to a shared package. encapsulate supaglue concepts into classes
  #getSyncStrategyConfig(syncConfig: SyncConfig, sync: Sync): SyncStrategyConfig {
    if (sync.type === 'entity') {
      return syncConfig.config.defaultConfig;
    }
    if (sync.objectType === 'common') {
      return (
        syncConfig.config.commonObjects?.find((object) => object.object === sync.object)?.syncStrategyOverride ??
        syncConfig.config.defaultConfig
      );
    }
    if (sync.objectType === 'standard') {
      return (
        syncConfig.config.standardObjects?.find((object) => object.object === sync.object)?.syncStrategyOverride ??
        syncConfig.config.defaultConfig
      );
    }
    if (sync.objectType === 'custom') {
      return (
        syncConfig.config.customObjects?.find((object) => object.object === sync.object)?.syncStrategyOverride ??
        syncConfig.config.defaultConfig
      );
    }
    return syncConfig.config.defaultConfig;
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

      const syncType = fromSyncModel(sync);
      const strategyConfig = this.#getSyncStrategyConfig(syncConfig, syncType);

      await this.#prisma.sync.update({
        where: {
          id: sync.id,
        },
        data: {
          strategy: {
            type: strategyConfig.strategy ?? 'full then incremental',
            fullSyncEveryNIncrementals: strategyConfig.fullSyncEveryNIncrementals,
          },
        },
      });

      await this.upsertTemporalSync(syncType, connection, strategyConfig.periodMs ?? FIFTEEN_MINUTES_MS);
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

    const searchAttributes = {
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
      searchAttributes,
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
        searchAttributes,
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
