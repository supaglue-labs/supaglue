import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type { createActivities } from '../activities/index';

const { doProcessSyncChanges } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '30 second',
});

export const PROCESS_SYNC_CHANGES_SCHEDULE_ID = 'periodically-process-sync-changes';
export const PROCESS_SYNC_CHANGES_WORKFLOW_ID = 'periodically-process-sync-changes';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ProcessSyncChangesArgs = {};

export async function processSyncChanges(args: ProcessSyncChangesArgs): Promise<void> {
  await doProcessSyncChanges({});
}
