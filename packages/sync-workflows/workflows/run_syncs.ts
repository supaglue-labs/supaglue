import { CRM_COMMON_MODELS } from '@supaglue/core/types';
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type { createActivities } from '../activities';

const { doSync, populateAssociations, logSyncStart, logSyncFinish } = proxyActivities<
  ReturnType<typeof createActivities>
>({
  startToCloseTimeout: '5 minute',
});

export const getRunSyncsScheduleId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;
export const getRunSyncsWorkflowId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;

export type RunSyncsArgs = {
  connectionId: string;
  sessionId?: string; // unique session id for analytics
};

export async function runSyncs({ connectionId, sessionId }: RunSyncsArgs): Promise<void> {
  const historyIds = await Promise.all(
    CRM_COMMON_MODELS.map((commonModel) => logSyncStart({ connectionId, commonModel }))
  );
  const results = await Promise.allSettled(
    CRM_COMMON_MODELS.map((commonModel, idx) => doSync({ connectionId, commonModel, sessionId }))
  );
  await Promise.all(
    results.map(async (result, idx) => {
      if (result.status === 'fulfilled') {
        await logSyncFinish({ historyId: historyIds[idx], status: 'SUCCESS' });
      } else {
        await logSyncFinish({
          historyId: historyIds[idx],
          status: 'FAILURE',
          errorMessage: result.reason.message ?? 'Unknown error',
        });
      }
    })
  );
  await populateAssociations({ connectionId });
}
