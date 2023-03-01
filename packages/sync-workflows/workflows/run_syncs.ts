import { CRM_COMMON_MODELS } from '@supaglue/core/types';
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type { createActivities } from '../activities/index';

const { doSync, populateAssociations } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '5 minute',
});

export const getRunSyncsScheduleId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;
export const getRunSyncsWorkflowId = (connectionId: string): string => `run-syncs-cid-${connectionId}`;

export type RunSyncsArgs = {
  connectionId: string;
  sessionId?: string; // unique session id for analytics
};

export async function runSyncs({ connectionId, sessionId }: RunSyncsArgs): Promise<void> {
  CRM_COMMON_MODELS.map(async (commonModel) => await doSync({ connectionId, commonModel, sessionId }));
  await populateAssociations({ connectionId });
}
