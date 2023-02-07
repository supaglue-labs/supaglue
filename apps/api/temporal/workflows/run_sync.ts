import { ActivityFailure, ApplicationFailure, LoggerSinks, proxyActivities, proxySinks } from '@temporalio/workflow';
import type * as activities from '../activities';

const { defaultWorkerLogger: logger } = proxySinks<LoggerSinks>();

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
      const errorMessage =
        err.cause.failure?.message ??
        err.failure?.cause?.message ??
        err.failure?.message ??
        err.message ??
        'Unknown error';
      await finishSyncRun({ syncRunId, errorMessage });
      await pauseSync({ syncId, note: errorMessage });
      logger.error(`Sync run ${syncRunId} failed: ${errorMessage}`, { syncId });
    }
    throw err;
  }

  await finishSyncRun({ syncRunId });
}
