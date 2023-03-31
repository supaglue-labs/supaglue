import { TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@/temporal/index';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import { PrismaClient, Sync as SyncModel } from '@supaglue/db';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { getRunSyncScheduleId, getRunSyncWorkflowId, runSync } from '@supaglue/sync-workflows/workflows/run_sync';
import { ConnectionSafe, CRM_COMMON_MODELS, FullThenIncrementalSync, Sync, SyncState, SyncType } from '@supaglue/types';
import { SyncInfo, SyncInfoFilter, SyncStatus } from '@supaglue/types/sync_info';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';
import { v4 as uuidv4 } from 'uuid';

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

export class SyncService {
  #prisma: PrismaClient;
  #temporalClient: Client;
  #connectionService: ConnectionService;

  public constructor(prisma: PrismaClient, temporalClient: Client, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
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

  public async cleanUpSyncsForApplication(applicationId: string): Promise<void> {
    // TODO: Seems like an inefficient query. Maybe want to denormalize a bit later.
    const syncs = await this.#prisma.sync.findMany({
      where: {
        connection: {
          integration: {
            applicationId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Delete sync schedules
    const syncScheduleHandles = syncs.map((sync) =>
      this.#temporalClient.schedule.getHandle(getRunSyncScheduleId(sync.id))
    );
    await Promise.all(syncScheduleHandles.map((handle) => handle.delete()));

    // Delete sync workflows
    const syncWorkflowHandles = syncs.map((sync) =>
      this.#temporalClient.workflow.getHandle(getRunSyncWorkflowId(sync.id))
    );
    await Promise.all(syncWorkflowHandles.map((handle) => handle.terminate(`Deleting application ${applicationId}`)));
  }

  public async createSync(connection: ConnectionSafe, syncPeriodMs: number): Promise<Sync> {
    // Create sync as type first to get type-checking
    const sync: FullThenIncrementalSync = {
      id: uuidv4(),
      connectionId: connection.id,
      type: 'full then incremental',
      state: {
        phase: 'created',
      },
    };

    await this.#prisma.sync.create({
      data: {
        id: sync.id,
        connectionId: sync.connectionId,
        strategy: {
          type: sync.type,
        },
        state: sync.state,
      },
    });

    // TODO: We need do this transactionally and not best-effort. Maybe transactionally write
    // an event to another table and have a background job pick this up to guarantee
    // that we start up syncs when connections are created.
    // TODO: Do this for non-CRM models
    await this.#createSyncsSchedule(sync.id, connection, syncPeriodMs);

    return sync;
  }

  async #createSyncsSchedule(syncId: string, connection: ConnectionSafe, syncPeriodMs: number): Promise<void> {
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
          args: [{ syncId, connectionId: connection.id }],
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
