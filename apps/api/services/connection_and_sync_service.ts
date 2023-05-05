import { NotFoundError } from '@supaglue/core/errors';
import { logger, maybeSendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import type { IntegrationService } from '@supaglue/core/services';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import { TEMPORAL_CONTEXT_ARGS, TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@supaglue/core/temporal';
import { PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import {
  processSyncChanges,
  PROCESS_SYNC_CHANGES_SCHEDULE_ID,
  PROCESS_SYNC_CHANGES_WORKFLOW_ID,
} from '@supaglue/sync-workflows/workflows/process_sync_changes';
import {
  getRunSyncScheduleId,
  getRunSyncWorkflowId,
  runSync,
  RUN_SYNC_PREFIX,
} from '@supaglue/sync-workflows/workflows/run_sync';
import { CRM_COMMON_MODELS, ProviderName, Sync, SyncIdentifier, SyncState, SyncType } from '@supaglue/types';
import type {
  ConnectionCreateParamsAny,
  ConnectionSafeAny,
  ConnectionStatus,
  ConnectionUnsafeAny,
  ConnectionUpsertParamsAny,
} from '@supaglue/types/connection';
import { SyncInfo, SyncInfoFilter, SyncStatus } from '@supaglue/types/sync_info';
import { Client, ScheduleAlreadyRunning, WorkflowNotFoundError } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';
import type { ApplicationService } from './application_service';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export class ConnectionAndSyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #integrationService: IntegrationService;
  #applicationService: ApplicationService;
  #connectionService: ConnectionService;

  constructor(
    prisma: PrismaClient,
    temporalClient: Client,
    integrationService: IntegrationService,
    applicationService: ApplicationService,
    connectionService: ConnectionService
  ) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#integrationService = integrationService;
    this.#applicationService = applicationService;
    this.#connectionService = connectionService;
  }

  public async upsert(params: ConnectionUpsertParamsAny): Promise<ConnectionUnsafeAny> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        applicationId_providerName: {
          applicationId: params.applicationId,
          providerName: params.providerName,
        },
      },
    });
    if (!integration) {
      throw new Error(`No integration found for ${params.providerName}`);
    }
    const status: ConnectionStatus = 'added';
    const customerId = getCustomerIdPk(params.applicationId, params.customerId);
    const connection = await this.#prisma.connection.upsert({
      create: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: integration.id,
        status,
        remoteId: params.remoteId,
        credentials: await encrypt(JSON.stringify(params.credentials)),
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: integration.id,
        status,
        remoteId: params.remoteId,
        credentials: await encrypt(JSON.stringify(params.credentials)),
      },
      where: {
        customerId_integrationId: {
          customerId: customerId,
          integrationId: integration.id,
        },
      },
    });

    return fromConnectionModelToConnectionUnsafe<ProviderName>(connection);
  }

  public async create(params: ConnectionCreateParamsAny): Promise<ConnectionUnsafeAny> {
    const integration = await this.#integrationService.getByProviderNameAndApplicationId(
      params.providerName,
      params.applicationId
    );
    const application = await this.#applicationService.getById(integration.applicationId);
    let errored = false;

    try {
      const status: ConnectionStatus = 'added';

      const connectionId = uuidv4();
      const syncId = uuidv4();

      const [connectionModel] = await this.#prisma.$transaction([
        this.#prisma.connection.create({
          data: {
            id: connectionId,
            category: params.category,
            providerName: params.providerName,
            customerId: getCustomerIdPk(params.applicationId, params.customerId),
            integrationId: integration.id,
            status,
            remoteId: params.remoteId,
            credentials: await encrypt(JSON.stringify(params.credentials)),
          },
        }),
        this.#prisma.sync.create({
          data: {
            id: syncId,
            connectionId,
            strategy: {
              type: 'full then incremental',
            },
            state: {
              phase: 'created',
            },
          },
        }),
        this.#prisma.syncChange.create({
          data: {
            syncId,
          },
        }),
      ]);

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
        integration: {
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

  public async createProcessSyncChangesTemporalScheduleIfNotExist(): Promise<void> {
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: PROCESS_SYNC_CHANGES_SCHEDULE_ID,
        spec: {
          intervals: [
            {
              every: 60 * 1000, // 1 minute
            },
          ],
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
        // swallow
        // TODO: Allow updating the schedule
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
    // Find all the syncs in our DB
    // TODO: paginate
    const syncs = await this.#prisma.sync.findMany({
      select: {
        id: true,
        connectionId: true,
      },
    });
    const expectedSyncIds = syncs.map((sync) => sync.id);
    const expectedScheduleIds = expectedSyncIds.map(getRunSyncScheduleId);
    const expectedWorkflowIdPrefixes = expectedSyncIds.map(getRunSyncWorkflowId);

    // List out all the schedules in Temporal
    const scheduleIdsDeleted: string[] = [];
    for await (const schedule of this.#temporalClient.schedule.list()) {
      // If the corresponding sync is not in our DB, delete it
      // TODO: for some reason `schedule.action` is undefined for `runSync` schedules, but not in tctl
      if (schedule.scheduleId.startsWith(RUN_SYNC_PREFIX) && !expectedScheduleIds.includes(schedule.scheduleId)) {
        const handle = this.#temporalClient.schedule.getHandle(schedule.scheduleId);
        await handle.delete();
        scheduleIdsDeleted.push(schedule.scheduleId);
      }
    }

    // List out all the workflows in Temporal
    const workflowIdsTerminated: string[] = [];
    for await (const workflow of this.#temporalClient.workflow.list()) {
      if (workflow.status.name !== 'RUNNING') {
        continue;
      }
      // If the corresponding sync is not in our DB, delete it
      if (
        workflow.workflowId.startsWith(RUN_SYNC_PREFIX) &&
        !expectedWorkflowIdPrefixes.some((prefix) => workflow.workflowId.startsWith(prefix))
      ) {
        const handle = this.#temporalClient.workflow.getHandle(workflow.workflowId);
        try {
          await handle.terminate('could not find corresponding sync in DB');
          workflowIdsTerminated.push(workflow.workflowId);
        } catch (err) {
          if (err instanceof WorkflowNotFoundError) {
            // swallow
          }
        }
      }
    }

    // Upsert schedules in case
    const connectionIds = syncs.map((sync) => sync.connectionId);
    const connections = await this.#connectionService.getSafeByIds(connectionIds);

    // Get the integrations
    const integrationIds = connections.map((connection) => connection.integrationId);
    const integrations = await this.#integrationService.getByIds(integrationIds);

    // Upsert schedules for all the syncs (currently ignores updating periodMs)
    const scheduleIdsCreated: string[] = [];
    for (const syncId of expectedSyncIds) {
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
      const justCreated = await this.#createTemporalSyncIfNotExist(
        syncId,
        connection,
        integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS
      );

      if (justCreated) {
        scheduleIdsCreated.push(getRunSyncScheduleId(syncId));
      }
    }

    return {
      scheduleIdsDeleted,
      workflowIdsTerminated,
      scheduleIdsCreated,
    };
  }

  async #createTemporalSyncIfNotExist(
    syncId: string,
    connection: ConnectionSafeAny,
    syncPeriodMs: number
  ): Promise<boolean> {
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
          args: [
            {
              syncId,
              connectionId: connection.id,
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
        },
        state: {
          triggerImmediately: true,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ScheduleAlreadyRunning) {
        // swallow
        // TODO: Allow updating the schedule
        return false;
      }

      throw err;
    }

    return true;
  }

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
    const syncIds = syncs.map((sync) => sync.id);

    const metadataList = await Promise.all(
      syncIds.map(async (syncId) => ({ syncId, ...(await this.getMetadataFromSyncSchedule(syncId)) }))
    );
    return metadataList.flatMap(({ syncId, lastSyncStart, nextSyncStart, status }) => {
      const connection = connections.find(
        (connection) => connection.id === syncs.find((sync) => sync.id === syncId)?.connectionId
      );
      if (!connection) {
        throw new Error('Unexpectedly could not find connection for sync');
      }
      const { id: connectionId, applicationId, customerId, category, providerName } = connection;
      return CRM_COMMON_MODELS.map((commonModel) => ({
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

  private async getMetadataFromSyncSchedule(syncId: string): Promise<{
    lastSyncStart: Date | null;
    nextSyncStart: Date | null;
    status: SyncStatus | null;
  }> {
    const scheduleId = getRunSyncScheduleId(syncId);
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
    ...otherStrategyProps,
    state: model.state as SyncState,
  } as Sync;
}
