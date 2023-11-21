import type { ProviderCategory } from '@supaglue/types/common';
import { ActivityFailure, ApplicationFailure, proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import { ForbiddenError, UnauthorizedError } from '@supaglue/core/errors';
import type { FullThenIncrementalSync, Sync } from '@supaglue/types/sync';
import type { createActivities } from '../activities/index';

// TODO: Rename this to `runSync` when we have time. It will be a backwards incompatible change.
// We will need to re-create all the schedules to use the new workflow name.

const { syncObjectRecords, syncEntityRecords } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '20 second',
  retry: {
    // We need to retry at least once because the activity might fail during a deploy
    maximumAttempts: 3,
  },
});

const {
  getSync,
  pauseSync,
  updateSyncState,
  clearSyncArgsForNextRun,
  logSyncStart,
  logSyncFinish,
  getEntity,
  getSyncStrategy,
} = proxyActivities<ReturnType<typeof createActivities>>({
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

// TODO: change these params to remove 'object' prefix when we have time. It'll be backwards incompatible.

export type RunObjectSyncArgs = {
  syncId: string;
  connectionId: string;
  category: ProviderCategory;
  context: Record<string, unknown>;
};

// Returns pause reason if sync should be paused
function getPauseReasonIfShouldPause(err: any): string | undefined {
  if (err.cause?.type === 'SGConnectionNoLongerAuthenticatedError') {
    return `Connection no longer authenticated: ${err.cause.message}`;
  }
  if (err instanceof ForbiddenError || err.cause?.type === 'ForbiddenError') {
    return `Forbidden: ${err.cause?.message ?? err.message}`;
  }
  if (err.cause?.failure?.message.startsWith('No entity mapping found for entity')) {
    return err.cause.failure.message;
  }
  if (err.cause?.failure?.message.startsWith('Additional field mappings are not allowed')) {
    return `Customer attempted to add additional field mappings for entity where additional field mappings are not allowed`;
  }
  if (err.cause?.failure?.message === 'The requested resource does not exist') {
    return `The requested resource does not exist.`;
  }
  if (err instanceof UnauthorizedError) {
    return `Unauthorized: ${err.message}`;
  }
}

export async function runObjectSync({ syncId, connectionId, category }: RunObjectSyncArgs): Promise<void> {
  const { sync, runId } = await getSync({ syncId });

  const strategy = await getSyncStrategy({ sync });

  // Record that sync has started
  await logSyncStart({
    syncId,
    runId,
    strategy,
  });

  let numRecordsSynced: number | undefined;
  try {
    numRecordsSynced =
      strategy === 'full' ? await doFullSync(sync) : await doIncrementalSync(sync as FullThenIncrementalSync);
    await clearSyncArgsForNextRun({ syncId });
  } catch (err: any) {
    // Process SG Sync Worker errors
    const pauseReason = getPauseReasonIfShouldPause(err);
    if (pauseReason) {
      await pauseSync({ connectionId, syncId, pauseReason });
    }

    const { message: errorMessage, stack: errorStack } = getErrorMessageStack(err);

    await logSyncFinish({
      syncId: syncId,
      connectionId,
      runId,
      status: 'FAILURE',
      errorMessage,
      errorStack,
      numRecordsSynced: null,
    });

    if (sync.type === 'object') {
      await maybeSendSyncFinishWebhook({
        runId,
        status: 'SYNC_ERROR',
        connectionId,
        // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
        numRecordsSynced: 0,
        type: 'object',
        objectType: sync.objectType,
        object: sync.object,
        errorMessage,
      });
    } else {
      const {
        entity: { name: entityName },
      } = await getEntity({ entityId: sync.entityId });
      await maybeSendSyncFinishWebhook({
        runId,
        status: 'SYNC_ERROR',
        connectionId,
        // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
        numRecordsSynced: 0,
        type: 'entity',
        entityId: sync.entityId,
        errorMessage,
        entityName,
      });
    }

    throw err;
  }

  if (numRecordsSynced === undefined) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRecordsSynced was not set');
  }

  await logSyncFinish({
    syncId: syncId,
    connectionId,
    runId,
    status: 'SUCCESS',
    numRecordsSynced,
  });
  if (sync.type === 'object') {
    await maybeSendSyncFinishWebhook({
      runId,
      status: 'SYNC_SUCCESS',
      connectionId,
      numRecordsSynced,
      type: 'object',
      objectType: sync.objectType,
      object: sync.object,
    });
  } else {
    const {
      entity: { name: entityName },
    } = await getEntity({ entityId: sync.entityId });

    await maybeSendSyncFinishWebhook({
      runId,
      status: 'SYNC_SUCCESS',
      connectionId,
      numRecordsSynced,
      type: 'entity',
      entityId: sync.entityId,
      entityName,
    });
  }
}

async function doFullSync(sync: Sync): Promise<number> {
  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'full',
      status: 'in progress',
    },
  });

  const isFullOnlySync = sync.strategyType === 'full only';

  const { maxLastModifiedAtMs: newMaxLastModifiedAtMs, numRecordsSynced } =
    sync.type === 'object'
      ? await syncObjectRecords({
          syncId: sync.id,
          connectionId: sync.connectionId,
          objectType: sync.objectType,
          object: sync.object,
        })
      : await syncEntityRecords({
          syncId: sync.id,
          connectionId: sync.connectionId,
          entityId: sync.entityId,
        });

  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'full',
      status: 'done',
      maxLastModifiedAtMs: isFullOnlySync ? undefined : newMaxLastModifiedAtMs ?? 0,
    },
  });

  return numRecordsSynced;
}

async function doIncrementalSync(sync: FullThenIncrementalSync): Promise<number> {
  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'incremental',
      status: 'in progress',
      maxLastModifiedAtMs: sync.state.phase === 'created' ? undefined : sync.state.maxLastModifiedAtMs,
    },
  });

  const { maxLastModifiedAtMs: returnedMaxLastModifiedAtMs, numRecordsSynced } =
    sync.type === 'object'
      ? await syncObjectRecords({
          syncId: sync.id,
          connectionId: sync.connectionId,
          objectType: sync.objectType,
          object: sync.object,
          updatedAfterMs: sync.state.phase === 'created' ? undefined : sync.state.maxLastModifiedAtMs,
        })
      : await syncEntityRecords({
          syncId: sync.id,
          connectionId: sync.connectionId,
          entityId: sync.entityId,
          updatedAfterMs: sync.state.phase === 'created' ? undefined : sync.state.maxLastModifiedAtMs,
        });

  const newMaxLastModifiedAtMs = Math.max(
    returnedMaxLastModifiedAtMs ?? 0,
    sync.state.phase === 'created' ? 0 : sync.state.maxLastModifiedAtMs ?? 0
  );

  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'incremental',
      status: 'done',
      maxLastModifiedAtMs: newMaxLastModifiedAtMs,
    },
  });

  return numRecordsSynced;
}

const getErrorMessageStack = (err: Error): { message: string; stack: string } => {
  if (err instanceof ActivityFailure) {
    // Return the inner most error cause that is two layers deep, otherwise return the first child's error cause
    // so we don't return Temporal error messages to customers, but Provider error messages
    return {
      message: err.failure?.cause?.cause?.message ?? err.failure?.cause?.message ?? 'Unknown error',
      stack: err.failure?.cause?.cause?.stackTrace ?? err.failure?.cause?.stackTrace ?? 'No proto stack',
    };
  }
  if (err instanceof ApplicationFailure) {
    return { message: err.failure?.message ?? 'Unknown error', stack: err.failure?.stackTrace ?? 'No proto stack' };
  }
  return { message: err.message ?? 'Unknown error', stack: err.stack ?? 'No stack' };
};
