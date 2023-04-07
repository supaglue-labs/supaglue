import { logger, sendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import type { IntegrationService } from '@supaglue/core/services';
import { ConnectionService } from '@supaglue/core/services/connection_service';
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
  RUN_SYNC_PREFIX,
} from '@supaglue/sync-workflows/workflows/run_sync';
import { CRM_COMMON_MODELS, Sync, SyncState, SyncType } from '@supaglue/types';
import type {
  ConnectionCreateParams,
  ConnectionStatus,
  ConnectionUnsafe,
  ConnectionUpsertParams,
} from '@supaglue/types/connection';
import { SyncInfo, SyncInfoFilter, SyncStatus } from '@supaglue/types/sync_info';
import { Client, ScheduleAlreadyRunning, WorkflowNotFoundError } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';
import type { ApplicationService } from './application_service';

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

  public async upsert(params: ConnectionUpsertParams): Promise<ConnectionUnsafe> {
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
        credentials: encrypt(JSON.stringify(params.credentials)),
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: integration.id,
        status,
        remoteId: params.remoteId,
        credentials: encrypt(JSON.stringify(params.credentials)),
      },
      where: {
        customerId_integrationId: {
          customerId: customerId,
          integrationId: integration.id,
        },
      },
    });

    return fromConnectionModelToConnectionUnsafe(connection);
  }

  public async create(params: ConnectionCreateParams): Promise<ConnectionUnsafe> {
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
            credentials: encrypt(JSON.stringify(params.credentials)),
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

      const connection = fromConnectionModelToConnectionUnsafe(connectionModel);

      // best-effort trigger schedule to process sync changes. even if this fails, the
      // schedule will trigger the workflow on the next run
      this.#triggerProcessSyncChangesTemporalSchedule().catch((err) =>
        logger.error(err, 'Error triggering processSyncChanges Temporal schedule')
      );

      // // TODO: We need do this transactionally and not best-effort. Maybe transactionally write
      // // an event to another table and have a background job pick this up to guarantee
      // // that we start up syncs when connections are created.
      // // TODO: Do this for non-CRM models
      // await this.#createSyncsSchedule(syncId, connection, integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS);

      return connection;
    } catch (e) {
      errored = true;
      throw e;
    } finally {
      if (application.config.webhook) {
        await sendWebhookPayload(
          application.config.webhook,
          errored ? 'CONNECTION_ERROR' : 'CONNECTION_SUCCESS',
          params
        );
      }
    }
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

  public async manuallyCleanUpOrphanedTemporalSyncs(): Promise<{
    scheduleIdsDeleted: string[];
    workflowIdsTerminated: string[];
  }> {
    // Find all the syncs in our DB
    // TODO: paginate
    const syncs = await this.#prisma.sync.findMany();
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

    return {
      scheduleIdsDeleted,
      workflowIdsTerminated,
    };
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
