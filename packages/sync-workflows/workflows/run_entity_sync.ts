import type { ProviderCategory } from '@supaglue/types/common';
import { ActivityFailure, ApplicationFailure, proxyActivities, uuid4 } from '@temporalio/workflow';
// Only import the activity types
import type { FullOnlyEntitySync, FullThenIncrementalEntitySync } from '@supaglue/types/entity_sync';
import type { createActivities } from '../activities/index';

const { syncEntityRecords } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '5 minute',
  retry: {
    maximumAttempts: 3,
  },
});

const { getEntitySync, updateEntitySyncState, clearEntitySyncArgsForNextRun, logEntitySyncStart, logEntitySyncFinish } =
  proxyActivities<ReturnType<typeof createActivities>>({
    startToCloseTimeout: '10 second',
    retry: {
      maximumAttempts: 3,
    },
  });

const { maybeSendEntitySyncFinishWebhook } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '6 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export const RUN_ENTITY_SYNC_PREFIX = 'run-entity-sync-';
export const getRunEntitySyncScheduleId = (entitySyncId: string): string => `${RUN_ENTITY_SYNC_PREFIX}${entitySyncId}`;
export const getRunEntitySyncWorkflowId = (entitySyncId: string): string => `${RUN_ENTITY_SYNC_PREFIX}${entitySyncId}`;

export type RunEntitySyncArgs = {
  entitySyncId: string;
  connectionId: string;
  category: ProviderCategory;
  context: Record<string, unknown>;
};

export async function runEntitySync({ entitySyncId, connectionId, category }: RunEntitySyncArgs): Promise<void> {
  const { entitySync } = await getEntitySync({ entitySyncId });

  // Generate history id
  const runId = uuid4();

  // Record that sync has started
  await logEntitySyncStart({
    entitySyncId,
    runId,
    entityId: entitySync.entityId,
  });

  let numRecordsSynced: number | undefined;
  try {
    numRecordsSynced =
      entitySync.type === 'full then incremental'
        ? await doFullThenIncrementalSync(entitySync)
        : await doFullOnlySync(entitySync);
    await clearEntitySyncArgsForNextRun({ entitySyncId });
  } catch (err: any) {
    const { message: errorMessage, stack: errorStack } = getErrorMessageStack(err);

    await logEntitySyncFinish({
      entitySyncId,
      connectionId,
      runId,
      status: 'FAILURE',
      errorMessage,
      errorStack,
      numRecordsSynced: null,
    });
    await maybeSendEntitySyncFinishWebhook({
      historyId: runId,
      status: 'SYNC_ERROR',
      connectionId,
      // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
      numRecordsSynced: 0,
      entityId: entitySync.entityId,
      errorMessage,
    });

    throw err;
  }

  if (numRecordsSynced === undefined) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRecordsSynced was not set');
  }

  await logEntitySyncFinish({
    entitySyncId,
    connectionId,
    runId,
    status: 'SUCCESS',
    numRecordsSynced,
  });
  await maybeSendEntitySyncFinishWebhook({
    historyId: runId,
    status: 'SYNC_SUCCESS',
    connectionId,
    numRecordsSynced,
    entityId: entitySync.entityId,
  });
}

async function doFullOnlySync(entitySync: FullOnlyEntitySync): Promise<number> {
  await updateEntitySyncState({
    entitySyncId: entitySync.id,
    state: {
      phase: 'full',
      status: 'in progress',
    },
  });

  const { numRecordsSynced } = await syncEntityRecords({
    entitySyncId: entitySync.id,
    connectionId: entitySync.connectionId,
    entityId: entitySync.entityId,
  });

  await updateEntitySyncState({
    entitySyncId: entitySync.id,
    state: {
      phase: 'full',
      status: 'done',
    },
  });

  return numRecordsSynced;
}

async function doFullThenIncrementalSync(entitySync: FullThenIncrementalEntitySync): Promise<number> {
  async function doFullStage(): Promise<number> {
    await updateEntitySyncState({
      entitySyncId: entitySync.id,
      state: {
        phase: 'full',
        status: 'in progress',
      },
    });

    const { maxLastModifiedAtMs: newMaxLastModifiedAtMs, numRecordsSynced } = await syncEntityRecords({
      entitySyncId: entitySync.id,
      connectionId: entitySync.connectionId,
      entityId: entitySync.entityId,
    });

    await updateEntitySyncState({
      entitySyncId: entitySync.id,
      state: {
        phase: 'full',
        status: 'done',
        maxLastModifiedAtMs: newMaxLastModifiedAtMs ?? 0,
      },
    });

    return numRecordsSynced;
  }

  async function doIncrementalPhase(): Promise<number> {
    await updateEntitySyncState({
      entitySyncId: entitySync.id,
      state: {
        phase: 'incremental',
        status: 'in progress',
        maxLastModifiedAtMs: entitySync.state.phase === 'created' ? undefined : entitySync.state.maxLastModifiedAtMs,
      },
    });

    const { maxLastModifiedAtMs: returnedMaxLastModifiedAtMs, numRecordsSynced } = await syncEntityRecords({
      entitySyncId: entitySync.id,
      connectionId: entitySync.connectionId,
      entityId: entitySync.entityId,
      updatedAfterMs: entitySync.state.phase === 'created' ? undefined : entitySync.state.maxLastModifiedAtMs,
    });

    const newMaxLastModifiedAtMs = Math.max(
      returnedMaxLastModifiedAtMs ?? 0,
      entitySync.state.phase === 'created' ? 0 : entitySync.state.maxLastModifiedAtMs ?? 0
    );

    await updateEntitySyncState({
      entitySyncId: entitySync.id,
      state: {
        phase: 'incremental',
        status: 'done',
        maxLastModifiedAtMs: newMaxLastModifiedAtMs,
      },
    });

    return numRecordsSynced;
  }

  // Short-circuit normal state transitions if we're forcing a full refresh sync
  if (entitySync.argsForNextRun?.performFullRefresh) {
    return await doFullStage();
  }

  // Sync state transitions
  switch (entitySync.state.phase) {
    case 'created':
      return await doFullStage();
    case 'full':
      switch (entitySync.state.status) {
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
