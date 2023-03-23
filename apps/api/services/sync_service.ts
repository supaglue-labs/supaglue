import { TEMPORAL_CUSTOM_SEARCH_ATTRIBUTES } from '@/temporal/index';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { ConnectionService } from '@supaglue/core/services/connection_service';
import { ConnectionSafe, CRM_COMMON_MODELS } from '@supaglue/core/types/';
import { CommonModel } from '@supaglue/core/types/common';
import { SyncInfo, SyncInfoFilter } from '@supaglue/core/types/sync_info';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { getRunSyncsScheduleId, getRunSyncsWorkflowId, runSyncs } from '@supaglue/sync-workflows/workflows/run_syncs';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';

export class SyncService {
  #temporalClient: Client;
  #connectionService: ConnectionService;

  public constructor(temporalClient: Client, connectionService: ConnectionService) {
    this.#temporalClient = temporalClient;
    this.#connectionService = connectionService;
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
  public async createSyncsSchedule(connection: ConnectionSafe, syncPeriodMs: number): Promise<void> {
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
}
