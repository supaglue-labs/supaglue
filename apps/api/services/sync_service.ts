import { CRM_COMMON_MODELS } from '@supaglue/core/types/';
import { CommonModel } from '@supaglue/core/types/common';
import { SyncInfo } from '@supaglue/core/types/sync_info';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { getRunSyncsScheduleId, getRunSyncsWorkflowId, runSyncs } from '@supaglue/sync-workflows/workflows/run_syncs';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';

export class SyncService {
  #temporalClient: Client;

  public constructor(temporalClient: Client) {
    this.#temporalClient = temporalClient;
  }

  public async getSyncInfo(connectionId: string, commonModel: CommonModel): Promise<SyncInfo> {
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
    };
  }

  public async getSyncInfoList(connectionId: string): Promise<SyncInfo[]> {
    // TODO: Support other IntegrationCategory types
    return await Promise.all(CRM_COMMON_MODELS.map((commonModel) => this.getSyncInfo(connectionId, commonModel)));
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
              offset: 0,
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
