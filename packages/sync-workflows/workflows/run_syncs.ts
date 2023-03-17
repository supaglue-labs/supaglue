import { CRM_COMMON_MODELS } from '@supaglue/core/types/crm';
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type { createActivities } from '../activities';

const { doSync, populateAssociations } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '30 seconds',
});

const { logSyncStart, logSyncFinish, maybeSendSyncFinishWebhook } = proxyActivities<
  ReturnType<typeof createActivities>
>({
  startToCloseTimeout: '30 second',
});

export const getRunSyncsScheduleId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;
export const getRunSyncsWorkflowId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;

export type RunSyncsArgs = {
  connectionId: string;
};

export async function runSyncs({ connectionId }: RunSyncsArgs): Promise<void> {
  const historyIds = await Promise.all(
    CRM_COMMON_MODELS.map((commonModel) => logSyncStart({ connectionId, commonModel }))
  );
  const results = await Promise.allSettled(
    CRM_COMMON_MODELS.map((commonModel) => doSync({ connectionId, commonModel }))
  );
  // technically the sync isn't really complete since we haven't populated associations
  // but we want the per-model granularity on the logs
  await Promise.all(
    results.map(async (result, idx) => {
      if (result.status === 'fulfilled') {
        await logSyncFinish({ historyId: historyIds[idx], status: 'SUCCESS' });
        await maybeSendSyncFinishWebhook({
          historyId: historyIds[idx],
          status: 'SYNC_SUCCESS',
          connectionId,
          numRecordsSynced: result.value.numRecordsSynced,
          commonModel: CRM_COMMON_MODELS[idx],
        });
      } else {
        await logSyncFinish({
          historyId: historyIds[idx],
          status: 'FAILURE',
          errorMessage: result.reason.message ?? 'Unknown error',
        });
        await maybeSendSyncFinishWebhook({
          historyId: historyIds[idx],
          status: 'SYNC_ERROR',
          connectionId,
          // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
          numRecordsSynced: 0,
          commonModel: CRM_COMMON_MODELS[idx],
          errorMessage: result.reason.message ?? 'Unknown error',
        });
      }
    })
  );
  await populateAssociations({ connectionId });
}
