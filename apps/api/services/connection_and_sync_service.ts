import { NotFoundError } from '@supaglue/core/errors';
import { logger, maybeSendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import { ApplicationService, ProviderService, SyncConfigService } from '@supaglue/core/services';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import { PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  processSyncChanges,
  PROCESS_SYNC_CHANGES_SCHEDULE_ID,
  PROCESS_SYNC_CHANGES_WORKFLOW_ID,
} from '@supaglue/sync-workflows/workflows/process_sync_changes';
import { getRunManagedSyncScheduleId } from '@supaglue/sync-workflows/workflows/run_managed_sync';
import { getRunSyncScheduleId } from '@supaglue/sync-workflows/workflows/run_sync';
import type { ProviderName, Sync, SyncIdentifier, SyncState, SyncType } from '@supaglue/types';
import type {
  ConnectionCreateParamsAny,
  ConnectionStatus,
  ConnectionUnsafeAny,
  ConnectionUpsertParamsAny,
} from '@supaglue/types/connection';
import { CRM_COMMON_MODEL_TYPES } from '@supaglue/types/crm';
import { SyncInfo, SyncInfoFilter, SyncStatus } from '@supaglue/types/sync_info';
import { Client, ScheduleAlreadyRunning, ScheduleNotFoundError, WorkflowNotFoundError } from '@temporalio/client';
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
        // TODO: Delete
        integrationId: provider.id,
        providerId: provider.id,
        status,
        credentials: await encrypt(JSON.stringify(params.credentials)),
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: provider.id,
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

  public async create(version: 'v1' | 'v2', params: ConnectionCreateParamsAny): Promise<ConnectionUnsafeAny> {
    const provider = await this.#providerService.getByNameAndApplicationId(params.providerName, params.applicationId);
    const syncConfig = await this.#syncConfigService.findByProviderId(provider.id);
    const application = await this.#applicationService.getById(provider.applicationId);
    let errored = false;

    try {
      const status: ConnectionStatus = 'added';

      const connectionId = uuidv4();
      const syncId = uuidv4();

      const connectionModel = await this.#prisma.$transaction(async (tx) => {
        const connectionModel = await tx.connection.create({
          data: {
            id: connectionId,
            category: params.category,
            providerName: params.providerName,
            customerId: getCustomerIdPk(params.applicationId, params.customerId),
            // TODO: Delete
            integrationId: provider.id,
            providerId: provider.id,
            status,
            instanceUrl: params.instanceUrl,
            credentials: await encrypt(JSON.stringify(params.credentials)),
          },
        });
        if (syncConfig) {
          await tx.sync.create({
            data: {
              id: syncId,
              connectionId,
              syncConfigId: syncConfig.id,
              strategy: {
                type: syncConfig.config.defaultConfig.strategy,
              },
              state: {
                phase: 'created',
              },
              version,
            },
          });
          await tx.syncChange.create({
            data: {
              syncId,
            },
          });
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
        sync: {
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
      // Delete the sync, if it exists
      ...(connection.sync?.id
        ? [
            this.#prisma.sync.delete({
              where: {
                id: connection.sync.id,
              },
            }),
            this.#prisma.syncChange.create({
              data: {
                syncId: connection.sync.id,
              },
            }),
          ]
        : []),
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

  // TODO: Remove when we're done migrating
  async deleteTemporalSyncsV1(syncIds: string[]): Promise<void> {
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

  // TODO: Remove when we're done migrating
  async deleteTemporalSyncsV2(syncIds: string[]): Promise<void> {
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
  //       [TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES.INTEGRATION_ID]: [connection.integrationId],
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

  public async getSyncById(id: string): Promise<Sync> {
    const model = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return fromSyncModel(model);
  }

  public async getSyncByConnectionId(connectionId: string): Promise<Sync> {
    const model = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        connectionId,
      },
    });
    return fromSyncModel(model);
  }

  public async getSyncsByConnectionIds(connectionIds: string[]): Promise<Sync[]> {
    const models = await this.#prisma.sync.findMany({
      where: {
        connectionId: {
          in: connectionIds,
        },
      },
    });
    return models.map(fromSyncModel);
  }

  public async setForceSyncFlag(
    { applicationId, externalCustomerId, providerName }: SyncIdentifier,
    flag: boolean
  ): Promise<Sync> {
    const customerId = getCustomerIdPk(applicationId, externalCustomerId);
    const connection = await this.#connectionService.getSafeByCustomerIdAndApplicationIdAndProviderName({
      applicationId,
      customerId,
      providerName,
    });

    const model = await this.#prisma.sync.update({
      data: {
        forceSyncFlag: flag,
      },
      where: {
        connectionId: connection.id,
      },
    });

    return fromSyncModel(model);
  }

  public async getSyncInfoList({
    applicationId,
    externalCustomerId,
    providerName,
  }: SyncInfoFilter): Promise<SyncInfo[]> {
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const syncs = await this.getSyncsByConnectionIds(connections.map((connection) => connection.id));

    const metadataList = await Promise.all(
      syncs.map(async (sync) => ({
        syncId: sync.id,
        ...(await this.getMetadataFromSyncSchedule(sync.id, sync.version)),
      }))
    );

    return metadataList.flatMap(({ syncId, lastSyncStart, nextSyncStart, status }) => {
      const connection = connections.find(
        (connection) => connection.id === syncs.find((sync) => sync.id === syncId)?.connectionId
      );
      if (!connection) {
        throw new Error('Unexpectedly could not find connection for sync');
      }
      const { id: connectionId, applicationId, customerId, category, providerName } = connection;
      return CRM_COMMON_MODEL_TYPES.map((commonModel) => ({
        modelName: commonModel,
        lastSyncStart,
        nextSyncStart,
        status,
        connectionId,
        applicationId,
        customerId,
        category,
        providerName,
      }));
    });
  }

  private async getMetadataFromSyncSchedule(
    syncId: string,
    version: 'v1' | 'v2'
  ): Promise<{
    lastSyncStart: Date | null;
    nextSyncStart: Date | null;
    status: SyncStatus | null;
  }> {
    const scheduleId = version === 'v1' ? getRunSyncScheduleId(syncId) : getRunManagedSyncScheduleId(syncId);
    const handle = this.#temporalClient.schedule.getHandle(scheduleId);
    const description = await handle.describe();

    const lastSyncStart = description.info.recentActions.length
      ? description.info.recentActions[description.info.recentActions.length - 1].takenAt
      : null;
    const nextSyncStart = description.info.nextActionTimes.length ? description.info.nextActionTimes[0] : null;
    const status = lastSyncStart ? (description.info.runningActions.length ? 'SYNCING' : 'DONE') : null;

    return {
      lastSyncStart,
      nextSyncStart,
      status,
    };
  }
}

function fromSyncModel(model: SyncModel): Sync {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: SyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    type,
    version: model.version,
    ...otherStrategyProps,
    state: model.state as SyncState,
  } as Sync;
}
