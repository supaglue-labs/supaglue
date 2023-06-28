import { ProviderCategory } from '@supaglue/types/common';
import { ActivityFailure, ApplicationFailure, proxyActivities, uuid4 } from '@temporalio/workflow';
// Only import the activity types
import { FullOnlyObjectSync, FullThenIncrementalObjectSync } from '@supaglue/types/object_sync';
import type { createActivities } from '../activities/index';

const { syncRecords } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '15 minute',
  retry: {
    maximumAttempts: 3,
  },
});

const { getObjectSync, updateObjectSyncState, logObjectSyncStart, logObjectSyncFinish, setForceSyncFlag } =
  proxyActivities<ReturnType<typeof createActivities>>({
    startToCloseTimeout: '10 second',
    retry: {
      maximumAttempts: 3,
    },
  });

const { maybeSendSyncFinishWebhook } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '6 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export const RUN_OBJECT_SYNC_PREFIX = 'run-object-sync-';
export const getRunObjectSyncScheduleId = (objectSyncId: string): string => `${RUN_OBJECT_SYNC_PREFIX}${objectSyncId}`;
export const getRunObjectSyncWorkflowId = (objectSyncId: string): string => `${RUN_OBJECT_SYNC_PREFIX}${objectSyncId}`;

export type RunObjectSyncArgs = {
  objectSyncId: string;
  connectionId: string;
  category: ProviderCategory;
  context: Record<string, unknown>;
};

export async function runObjectSync({ objectSyncId, connectionId, category }: RunObjectSyncArgs): Promise<void> {
  const { objectSync } = await getObjectSync({ objectSyncId });

  // Generate history id
  const runId = uuid4();

  // Record that sync has started
  await logObjectSyncStart({
    objectSyncId,
    runId,
    objectType: objectSync.objectType,
    object: objectSync.object,
  });

  let numRecordsSynced: number | undefined;
  try {
    numRecordsSynced =
      objectSync.type === 'full then incremental'
        ? await doFullThenIncrementalSync(objectSync)
        : await doFullOnlySync(objectSync);
  } catch (err: any) {
    const { message: errorMessage, stack: errorStack } = getErrorMessageStack(err);

    await logObjectSyncFinish({
      objectSyncId,
      connectionId,
      runId,
      status: 'FAILURE',
      errorMessage,
      errorStack,
      numRecordsSynced: null,
    });
    await maybeSendSyncFinishWebhook({
      historyId: runId,
      status: 'SYNC_ERROR',
      connectionId,
      // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
      numRecordsSynced: 0,
      objectType: objectSync.objectType,
      object: objectSync.object,
      errorMessage,
    });

    throw err;
  }

  if (numRecordsSynced === undefined) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRecordsSynced was not set');
  }

  await logObjectSyncFinish({
    objectSyncId,
    connectionId,
    runId,
    status: 'SUCCESS',
    numRecordsSynced,
  });
  await maybeSendSyncFinishWebhook({
    historyId: runId,
    status: 'SYNC_SUCCESS',
    connectionId,
    numRecordsSynced,
    objectType: objectSync.objectType,
    object: objectSync.object,
  });
}

async function doFullOnlySync(objectSync: FullOnlyObjectSync): Promise<number> {
  await updateObjectSyncState({
    objectSyncId: objectSync.id,
    state: {
      phase: 'full',
      status: 'in progress',
    },
  });

  const { numRecordsSynced } = await syncRecords({
    objectSyncId: objectSync.id,
    connectionId: objectSync.connectionId,
    objectType: objectSync.objectType,
    object: objectSync.object,
  });

  await updateObjectSyncState({
    objectSyncId: objectSync.id,
    state: {
      phase: 'full',
      status: 'done',
    },
  });

  return numRecordsSynced;
}

async function doFullThenIncrementalSync(objectSync: FullThenIncrementalObjectSync): Promise<number> {
  async function doFullStage(): Promise<number> {
    await updateObjectSyncState({
      objectSyncId: objectSync.id,
      state: {
        phase: 'full',
        status: 'in progress',
      },
    });

    const { maxLastModifiedAtMs: newMaxLastModifiedAtMs, numRecordsSynced } = await syncRecords({
      objectSyncId: objectSync.id,
      connectionId: objectSync.connectionId,
      objectType: objectSync.objectType,
      object: objectSync.object,
    });

    await updateObjectSyncState({
      objectSyncId: objectSync.id,
      state: {
        phase: 'full',
        status: 'done',
        maxLastModifiedAtMs: newMaxLastModifiedAtMs ?? 0,
      },
    });

    return numRecordsSynced;
  }

  async function doIncrementalPhase(): Promise<number> {
    await updateObjectSyncState({
      objectSyncId: objectSync.id,
      state: {
        phase: 'incremental',
        status: 'in progress',
        maxLastModifiedAtMs: objectSync.state.phase === 'created' ? undefined : objectSync.state.maxLastModifiedAtMs,
      },
    });

    const { maxLastModifiedAtMs: returnedMaxLastModifiedAtMs, numRecordsSynced } = await syncRecords({
      objectSyncId: objectSync.id,
      connectionId: objectSync.connectionId,
      objectType: objectSync.objectType,
      object: objectSync.object,
      updatedAfterMs: objectSync.state.phase === 'created' ? undefined : objectSync.state.maxLastModifiedAtMs,
    });

    const newMaxLastModifiedAtMs = Math.max(
      returnedMaxLastModifiedAtMs ?? 0,
      objectSync.state.phase === 'created' ? 0 : objectSync.state.maxLastModifiedAtMs ?? 0
    );

    await updateObjectSyncState({
      objectSyncId: objectSync.id,
      state: {
        phase: 'incremental',
        status: 'done',
        maxLastModifiedAtMs: newMaxLastModifiedAtMs,
      },
    });

    return numRecordsSynced;
  }

  // Short circuit normal state transitions if we're forcing a sync which will reset the state
  if (objectSync.forceSyncFlag) {
    const results = await doFullStage();
    await setForceSyncFlag({ syncId: objectSync.id }, false);
    return results;
  }

  // Sync state transitions
  switch (objectSync.state.phase) {
    case 'created':
      return await doFullStage();
    case 'full':
      switch (objectSync.state.status) {
        case 'in progress':
          return await doFullStage();
        case 'done':
          return await doIncrementalPhase();
      }
      break;
    case 'incremental':
      return await doIncrementalPhase();
  }
}

const getErrorMessageStack = (err: Error): { message: string; stack: string } => {
  if (err instanceof ActivityFailure) {
    return {
      message: err.failure?.cause?.message ?? 'Unknown error',
      stack: err.failure?.cause?.stackTrace ?? 'No proto stack',
    };
  }
  if (err instanceof ApplicationFailure) {
    return { message: err.failure?.message ?? 'Unknown error', stack: err.failure?.stackTrace ?? 'No proto stack' };
  }
  return { message: err.message ?? 'Unknown error', stack: err.stack ?? 'No stack' };
};
