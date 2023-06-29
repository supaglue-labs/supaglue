import { NotFoundError } from '@supaglue/core/errors';
import { logger, maybeSendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import { ApplicationService, ProviderService, SyncConfigService } from '@supaglue/core/services';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import type { Prisma } from '@supaglue/db';
import { PrismaClient } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  processSyncChanges,
  PROCESS_SYNC_CHANGES_SCHEDULE_ID,
  PROCESS_SYNC_CHANGES_WORKFLOW_ID,
} from '@supaglue/sync-workflows/workflows/process_sync_changes';
import type { ProviderName } from '@supaglue/types';
import type {
  ConnectionCreateParamsAny,
  ConnectionStatus,
  ConnectionUnsafeAny,
  ConnectionUpsertParamsAny,
} from '@supaglue/types/connection';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';

export class ConnectionAndSyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #providerService: ProviderService;
  #syncConfigService: SyncConfigService;
  #applicationService: ApplicationService;
  #connectionService: ConnectionService;

  constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    providerService: ProviderService,
    syncConfigService: SyncConfigService,
    applicationService: ApplicationService,
    connectionService: ConnectionService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#providerService = providerService;
    this.#syncConfigService = syncConfigService;
    this.#applicationService = applicationService;
    this.#connectionService = connectionService;
  }

  public async upsert(params: ConnectionUpsertParamsAny): Promise<ConnectionUnsafeAny> {
    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId: params.applicationId,
          name: params.providerName,
        },
      },
    });
    if (!provider) {
      throw new Error(`No provider found for ${params.providerName}`);
    }
    const status: ConnectionStatus = 'added';
    const customerId = getCustomerIdPk(params.applicationId, params.customerId);
    const connection = await this.#prisma.connection.upsert({
      create: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        providerId: provider.id,
        status,
        credentials: await encrypt(JSON.stringify(params.credentials)),
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        providerId: provider.id,
        status,
        credentials: await encrypt(JSON.stringify(params.credentials)),
      },
      where: {
        customerId_providerId: {
          customerId,
          providerId: provider.id,
        },
      },
    });

    return fromConnectionModelToConnectionUnsafe<ProviderName>(connection);
  }

  public async create(params: ConnectionCreateParamsAny): Promise<ConnectionUnsafeAny> {
    const provider = await this.#providerService.getByNameAndApplicationId(params.providerName, params.applicationId);
    const syncConfig = await this.#syncConfigService.findByProviderId(provider.id);
    const application = await this.#applicationService.getById(provider.applicationId);
    let errored = false;

    try {
      const status: ConnectionStatus = 'added';

      const connectionId = uuidv4();

      const connectionModel = await this.#prisma.$transaction(async (tx) => {
        const connectionModel = await tx.connection.create({
          data: {
            id: connectionId,
            category: params.category,
            providerName: params.providerName,
            customerId: getCustomerIdPk(params.applicationId, params.customerId),
            providerId: provider.id,
            status,
            instanceUrl: params.instanceUrl,
            credentials: await encrypt(JSON.stringify(params.credentials)),
          },
        });

        if (syncConfig) {
          // New syncs
          const objectSyncIds: string[] = [];

          if (syncConfig.config.commonObjects?.length) {
            const commonObjectSyncArgs: Prisma.ObjectSyncCreateManyInput[] = [];
            for (const commonObject of syncConfig.config.commonObjects) {
              const commonObjectSyncId = uuidv4();
              objectSyncIds.push(commonObjectSyncId);
              commonObjectSyncArgs.push({
                id: commonObjectSyncId,
                objectType: 'common',
                object: commonObject.object,
                connectionId,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.objectSync.createMany({
              data: commonObjectSyncArgs,
            });
          }

          if (syncConfig.config.standardObjects?.length) {
            const standardObjectSyncArgs: Prisma.ObjectSyncCreateManyInput[] = [];
            for (const standardObject of syncConfig.config.standardObjects) {
              const standardObjectSyncId = uuidv4();
              objectSyncIds.push(standardObjectSyncId);
              standardObjectSyncArgs.push({
                id: standardObjectSyncId,
                objectType: 'standard',
                object: standardObject.object,
                connectionId,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.objectSync.createMany({
              data: standardObjectSyncArgs,
            });
          }

          if (syncConfig.config.customObjects?.length) {
            const customObjectSyncArgs: Prisma.ObjectSyncCreateManyInput[] = [];
            for (const customObject of syncConfig.config.customObjects) {
              const customObjectSyncId = uuidv4();
              objectSyncIds.push(customObjectSyncId);
              customObjectSyncArgs.push({
                id: customObjectSyncId,
                objectType: 'custom',
                object: customObject.object,
                connectionId,
                syncConfigId: syncConfig.id,
                strategy: {
                  type: syncConfig.config.defaultConfig.strategy ?? 'full then incremental',
                },
                state: {
                  phase: 'created',
                },
              });
            }
            await tx.objectSync.createMany({
              data: customObjectSyncArgs,
            });
          }

          if (objectSyncIds.length) {
            await tx.objectSyncChange.createMany({
              data: objectSyncIds.map((objectSyncId) => ({
                objectSyncId,
              })),
            });
          }
        }
        return connectionModel;
      });

      const connection = await fromConnectionModelToConnectionUnsafe<ProviderName>(connectionModel);

      // best-effort trigger schedule to process sync changes. even if this fails, the
      // schedule will trigger the workflow on the next run
      this.#triggerProcessSyncChangesTemporalSchedule().catch((err) =>
        logger.error(err, 'Error triggering processSyncChanges Temporal schedule')
      );

      return connection;
    } catch (e) {
      errored = true;
      throw e;
    } finally {
      if (application.config.webhook) {
        await maybeSendWebhookPayload(
          application.config.webhook,
          errored ? 'CONNECTION_ERROR' : 'CONNECTION_SUCCESS',
          params
        );
      }
    }
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    const connection = await this.#prisma.connection.findFirst({
      where: {
        id,
        provider: {
          applicationId,
        },
      },
      include: {
        objectSyncs: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!connection) {
      throw new NotFoundError(`Could not find connection ${id} with application id ${applicationId}`);
    }

    await this.#prisma.$transaction([
      // Delete the object syncs, if they exist
      ...connection.objectSyncs.flatMap((objectSync) => [
        this.#prisma.objectSync.delete({
          where: {
            id: objectSync.id,
          },
        }),
        this.#prisma.objectSyncChange.create({
          data: {
            objectSyncId: objectSync.id,
          },
        }),
      ]),
      this.#prisma.connection.delete({
        where: {
          id,
        },
      }),
    ]);
  }

  async #triggerProcessSyncChangesTemporalSchedule(): Promise<void> {
    const handle = this.#temporalClient.schedule.getHandle(PROCESS_SYNC_CHANGES_SCHEDULE_ID);
    await handle.trigger();
  }

  public async upsertProcessSyncChangesTemporalSchedule(): Promise<void> {
    const intervals = [
      {
        every: 10 * 1000, // 10 seconds
      },
    ];
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: PROCESS_SYNC_CHANGES_SCHEDULE_ID,
        spec: {
          intervals,
        },
        action: {
          type: 'startWorkflow',
          workflowType: processSyncChanges,
          workflowId: PROCESS_SYNC_CHANGES_WORKFLOW_ID,
          taskQueue: SYNC_TASK_QUEUE,
          args: [{}],
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        const handle = this.#temporalClient.schedule.getHandle(PROCESS_SYNC_CHANGES_SCHEDULE_ID);
        await handle.update((prev) => {
          return {
            ...prev,
            spec: {
              intervals,
            },
          };
        });
        return;
      }

      throw err;
    }
  }

  public async manuallyFixTemporalSyncs(): Promise<{
    scheduleIdsDeleted: string[];
    workflowIdsTerminated: string[];
    scheduleIdsCreated: string[];
  }> {
    throw new Error('Not functioning during v1 to v2 migration');

    // // Find all the syncs in our DB
    // // TODO: paginate
    // const syncs = await this.#prisma.sync.findMany({
    //   select: {
    //     id: true,
    //     connectionId: true,
    //   },
    // });
    // const expectedSyncIds = syncs.map((sync) => sync.id);
    // const expectedScheduleIds = expectedSyncIds.map(getRunSyncScheduleId);
    // const expectedWorkflowIdPrefixes = expectedSyncIds.map(getRunSyncWorkflowId);

    // // List out all the schedules in Temporal
    // const scheduleIdsDeleted: string[] = [];
    // for await (const schedule of this.#temporalClient.schedule.list()) {
    //   // If the corresponding sync is not in our DB, delete it
    //   // TODO: for some reason `schedule.action` is undefined for `runSync` schedules, but not in tctl
    //   if (schedule.scheduleId.startsWith(RUN_SYNC_PREFIX) && !expectedScheduleIds.includes(schedule.scheduleId)) {
    //     const handle = this.#temporalClient.schedule.getHandle(schedule.scheduleId);
    //     await handle.delete();
    //     scheduleIdsDeleted.push(schedule.scheduleId);
    //   }
    // }

    // // List out all the workflows in Temporal
    // const workflowIdsTerminated: string[] = [];
    // for await (const workflow of this.#temporalClient.workflow.list()) {
    //   if (workflow.status.name !== 'RUNNING') {
    //     continue;
    //   }
    //   // If the corresponding sync is not in our DB, delete it
    //   if (
    //     workflow.workflowId.startsWith(RUN_SYNC_PREFIX) &&
    //     !expectedWorkflowIdPrefixes.some((prefix) => workflow.workflowId.startsWith(prefix))
    //   ) {
    //     const handle = this.#temporalClient.workflow.getHandle(workflow.workflowId);
    //     try {
    //       await handle.terminate('could not find corresponding sync in DB');
    //       workflowIdsTerminated.push(workflow.workflowId);
    //     } catch (err) {
    //       if (err instanceof WorkflowNotFoundError) {
    //         // swallow
    //       }
    //     }
    //   }
    // }

    // // Upsert schedules in case
    // const connectionIds = syncs.map((sync) => sync.connectionId);
    // const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // // Get the integrations
    // const integrationIds = connections.map((connection) => connection.integrationId);
    // const integrations = await this.#integrationService.getByIds(integrationIds);

    // // Upsert schedules for all the syncs (currently ignores updating periodMs)
    // const scheduleIdsCreated: string[] = [];
    // for (const syncId of expectedSyncIds) {
    //   const sync = syncs.find((sync) => sync.id === syncId);
    //   if (!sync) {
    //     throw new Error('Unexpected error: sync not found');
    //   }
    //   const connection = connections.find((connection) => connection.id === sync.connectionId);
    //   if (!connection) {
    //     throw new Error('Unexpected error: connection not found');
    //   }
    //   const integration = integrations.find((integration) => integration.id === connection.integrationId);
    //   if (!integration) {
    //     throw new Error('Unexpected error: integration not found');
    //   }
    //   const justCreated = await this.#createTemporalSyncIfNotExist(
    //     syncId,
    //     connection,
    //     integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS
    //   );

    //   if (justCreated) {
    //     scheduleIdsCreated.push(getRunSyncScheduleId(syncId));
    //   }
    // }

    // return {
    //   scheduleIdsDeleted,
    //   workflowIdsTerminated,
    //   scheduleIdsCreated,
    // };
  }

  // async #createTemporalSyncIfNotExist(
  //   syncId: string,
  //   connection: ConnectionSafeAny,
  //   syncPeriodMs: number
  // ): Promise<boolean> {
  //   const scheduleId = getRunSyncScheduleId(syncId);
  //   const interval: IntervalSpec = {
  //     every: syncPeriodMs,
  //     // so that not everybody is refreshing and hammering the DB at the same time
  //     offset: Math.random() * syncPeriodMs,
  //   };
  //   const action: Omit<ScheduleOptionsAction, 'workflowId'> & { workflowId: string } = {
  //     type: 'startWorkflow' as const,
  //     workflowType: runSync,
  //     workflowId: getRunSyncWorkflowId(syncId),
  //     taskQueue: SYNC_TASK_QUEUE,
  //     args: [
  //       {
  //         syncId,
  //         connectionId: connection.id,
  //         category: connection.category,
  //         context: {
  //           [TEMPORAL_CONTEXT_ARGS.SYNC_ID]: syncId,
  //           [TEMPORAL_CONTEXT_ARGS.APPLICATION_ID]: connection.applicationId,
  //           [TEMPORAL_CONTEXT_ARGS.CUSTOMER_ID]: connection.customerId,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_ID]: connection.providerId,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_CATEGORY]: connection.category,
  //           [TEMPORAL_CONTEXT_ARGS.PROVIDER_NAME]: connection.providerName,
  //         },
  //       },
  //     ],
  //     searchAttributes: {
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.SYNC_ID]: [syncId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.APPLICATION_ID]: [connection.applicationId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CUSTOMER_ID]: [connection.customerId],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.CONNECTION_ID]: [connection.id],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_CATEGORY]: [connection.category],
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.PROVIDER_NAME]: [connection.providerName],
  //     },
  //   };

  //   try {
  //     await this.#temporalClient.schedule.create({
  //       scheduleId,
  //       spec: {
  //         intervals: [interval],
  //       },
  //       action,
  //       state: {
  //         triggerImmediately: true,
  //       },
  //     });
  //   } catch (err: unknown) {
  //     if (err instanceof ScheduleAlreadyRunning) {
  //       const handle = this.#temporalClient.schedule.getHandle(scheduleId);
  //       await handle.update((prev) => {
  //         const newInterval = prev.spec.intervals?.[0]?.every === syncPeriodMs ? prev.spec.intervals[0] : interval;

  //         return {
  //           ...prev,
  //           spec: {
  //             intervals: [newInterval],
  //           },
  //           action,
  //         };
  //       });

  //       return false;
  //     }

  //     throw err;
  //   }

  //   return true;
  // }
}
