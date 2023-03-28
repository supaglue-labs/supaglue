import { TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@/temporal/index';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import { ConnectionSafe, CRM_COMMON_MODELS, Sync, SyncState, SyncStrategy } from '@supaglue/core/types/';
import { CommonModel } from '@supaglue/core/types/common';
import { SyncInfo, SyncInfoFilter } from '@supaglue/core/types/sync_info';
import { PrismaClient } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { getRunSyncsScheduleId, getRunSyncsWorkflowId, runSyncs } from '@supaglue/sync-workflows/workflows/run_syncs';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #connectionService: ConnectionService;

  public constructor(prisma: PrismaClient, temporalClient: Client, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
  }

  public async getSync(id: string): Promise<Sync> {
    const syncModel = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return {
      id: syncModel.id,
      connectionId: syncModel.connectionId,
      strategy: syncModel.strategy as SyncStrategy,
      state: syncModel.state as SyncState,
    };
  }

  public async getSyncByConnectionId(connectionId: string): Promise<Sync> {
    const syncModel = await this.#prisma.sync.findUniqueOrThrow({
      where: {
        connectionId,
      },
    });

    return {
      id: syncModel.id,
      connectionId: syncModel.connectionId,
      strategy: syncModel.strategy as SyncStrategy,
      state: syncModel.state as SyncState,
    };
  }

  public async createSync(connection: ConnectionSafe, syncPeriodMs: number): Promise<Sync> {
    // Create sync as type first to get type-checking
    const sync: Sync = {
      id: uuidv4(),
      connectionId: connection.id,
      strategy: {
        type: 'reverse then forward',
        reverseSubStageCutoffTimestampMsList: [0],
      },
      state: {
        stage: 'created',
      },
    };

    await this.#prisma.sync.create({
      data: {
        id: sync.id,
        connectionId: sync.connectionId,
        strategy: sync.strategy,
        state: sync.state,
      },
    });

    // TODO: We need do this transactionally and not best-effort. Maybe transactionally write
    // an event to another table and have a background job pick this up to guarantee
    // that we start up syncs when connections are created.
    // TODO: Do this for non-CRM models
    await this.#createSyncsSchedule(connection, syncPeriodMs);

    return sync;
  }

  async #createSyncsSchedule(connection: ConnectionSafe, syncPeriodMs: number): Promise<void> {
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: getRunSyncsScheduleId(connection.id),
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
          workflowType: runSyncs,
          workflowId: getRunSyncsWorkflowId(connection.id),
          taskQueue: SYNC_TASK_QUEUE,
          args: [{ connectionId: connection.id }],
          searchAttributes: {
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
        return;
      }

      throw err;
    }
  }

  public async getSyncInfoList({
    applicationId,
    externalCustomerId,
    providerName,
  }: SyncInfoFilter): Promise<SyncInfo[]> {
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const out = await Promise.all(connections.flatMap((connection) => this.getSyncInfoListFromConnection(connection)));
    return out.flat();
  }

  private async getSyncInfoFromConnectionAndCommonModel(
    { id: connectionId, applicationId, customerId, category, providerName }: ConnectionSafe,
    commonModel: CommonModel
  ): Promise<SyncInfo> {
    const scheduleId = getRunSyncsScheduleId(connectionId);
    const handle = this.#temporalClient.schedule.getHandle(scheduleId);
    const description = await handle.describe();

    const lastSyncStart = description.info.recentActions.length
      ? description.info.recentActions[description.info.recentActions.length - 1].takenAt
      : null;
    const nextSyncStart = description.info.nextActionTimes.length ? description.info.nextActionTimes[0] : null;
    const status = lastSyncStart ? (description.info.runningActions.length ? 'SYNCING' : 'DONE') : null;

    return {
      modelName: commonModel,
      lastSyncStart,
      nextSyncStart,
      status,
      connectionId,
      applicationId,
      customerId,
      category,
      providerName,
    };
  }

  private async getSyncInfoListFromConnection(connection: ConnectionSafe): Promise<SyncInfo[]> {
    // TODO: Support other IntegrationCategory types
    return await Promise.all(
      CRM_COMMON_MODELS.map((commonModel) => this.getSyncInfoFromConnectionAndCommonModel(connection, commonModel))
    );
  }

  // TODO: Create CommonModel type
}
