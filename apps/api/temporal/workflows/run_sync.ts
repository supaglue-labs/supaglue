import { ActivityFailure, ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export function getRunSyncWorkflowId(syncId: string): string {
  return `run-sync-${syncId}`;
}

const { createSyncRun, finishSyncRun, pauseSync } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

const { doSync } = proxyActivities<typeof activities>({
  // TODO: Configure this and/or do activity heartbeats.
  startToCloseTimeout: '1 minute',
});

export type RunSyncArgs = {
  syncId: string;
};

export async function runSync({ syncId }: RunSyncArgs): Promise<void> {
  // TODO: Make this idempotent. Currently on retries we keep creating new sync runs.
  const { id: syncRunId } = await createSyncRun({ syncId });
  try {
    await doSync({ syncId, syncRunId });
  } catch (err: unknown) {
    if (
      err instanceof ActivityFailure &&
      err.cause &&
      err.cause instanceof ApplicationFailure &&
      err.cause.nonRetryable
    ) {
      await finishSyncRun({ syncRunId, errorMessage: err.message });
      await pauseSync({ syncId, note: err.message });
      return;
    }
    throw err;
  }

  await finishSyncRun({ syncRunId });
}
