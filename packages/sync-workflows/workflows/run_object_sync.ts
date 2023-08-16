import type { ProviderCategory } from '@supaglue/types/common';
import { ActivityFailure, ApplicationFailure, proxyActivities, uuid4 } from '@temporalio/workflow';
// Only import the activity types
import type { FullOnlySync, FullThenIncrementalSync } from '@supaglue/types/sync';
import type { createActivities } from '../activities/index';

// TODO: Rename this to `runSync` when we have time. It will be a backwards incompatible change.
// We will need to re-create all the schedules to use the new workflow name.

const { syncObjectRecords, syncEntityRecords } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '5 minute',
  retry: {
    maximumAttempts: 3,
  },
});

const { getSync, updateSyncState, clearSyncArgsForNextRun, logSyncStart, logSyncFinish, getEntity } = proxyActivities<
  ReturnType<typeof createActivities>
>({
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

export async function runObjectSync({ syncId, connectionId, category }: RunObjectSyncArgs): Promise<void> {
  const { sync } = await getSync({ syncId });

  // Generate history id
  const runId = uuid4();

  // Record that sync has started
  await logSyncStart({
    syncId,
    runId,
  });

  let numRecordsSynced: number | undefined;
  try {
    numRecordsSynced =
      sync.strategyType === 'full then incremental'
        ? await doFullThenIncrementalSync(sync)
        : await doFullOnlySync(sync);
    await clearSyncArgsForNextRun({ syncId });
  } catch (err: any) {
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
        id: runId,
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
        id: runId,
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
      id: runId,
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
      id: runId,
      status: 'SYNC_SUCCESS',
      connectionId,
      numRecordsSynced,
      type: 'entity',
      entityId: sync.entityId,
      entityName,
    });
  }
}

async function doFullOnlySync(sync: FullOnlySync): Promise<number> {
  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'full',
      status: 'in progress',
    },
  });

  const { numRecordsSynced } =
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
    },
  });

  return numRecordsSynced;
}

async function doFullThenIncrementalSync(sync: FullThenIncrementalSync): Promise<number> {
  async function doFullStage(): Promise<number> {
    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'in progress',
      },
    });

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
        maxLastModifiedAtMs: newMaxLastModifiedAtMs ?? 0,
      },
    });

    return numRecordsSynced;
  }

  async function doIncrementalPhase(): Promise<number> {
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

  // Short-circuit normal state transitions if we're forcing a full refresh sync
  if (sync.argsForNextRun?.performFullRefresh) {
    return await doFullStage();
  }

  // Sync state transitions
  switch (sync.state.phase) {
    case 'created':
      return await doFullStage();
    case 'full':
      switch (sync.state.status) {
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
