import { ConnectionService } from '@supaglue/core/services/connection_service';
import { ConnectionSafe, CRM_COMMON_MODELS } from '@supaglue/core/types/';
import { CommonModel } from '@supaglue/core/types/common';
import { SyncInfo } from '@supaglue/core/types/sync_info';
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

  public async getSyncInfoList(applicationId: string, customerId?: string, providerName?: string): Promise<SyncInfo[]> {
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const out = await Promise.all(connections.flatMap((connection) => this.getSyncInfoListFromConnection(connection)));
    return out.flat();
  }

  private async getSyncInfoFromConnectionAndCommonModel(
    { id: connectionId, customerId, category, providerName }: ConnectionSafe,
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
  public async createSyncsSchedule(connectionId: string, syncPeriodMs: number): Promise<void> {
    try {
      await this.#temporalClient.schedule.create({
        scheduleId: getRunSyncsScheduleId(connectionId),
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
          workflowId: getRunSyncsWorkflowId(connectionId),
          taskQueue: SYNC_TASK_QUEUE,
          args: [{ connectionId }],
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
