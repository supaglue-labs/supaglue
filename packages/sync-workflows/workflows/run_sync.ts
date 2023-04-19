import { CommonModel } from '@supaglue/types/common';
import { CRM_COMMON_MODELS } from '@supaglue/types/crm';
import { FullThenIncrementalSync, ReverseThenForwardSync } from '@supaglue/types/sync';
import { ActivityFailure, ApplicationFailure, proxyActivities, uuid4 } from '@temporalio/workflow';
// Only import the activity types
import { ImportRecordsResult } from '../activities/import_records';
import type { createActivities } from '../activities/index';

const { importRecords } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '8 minute',
  retry: {
    maximumAttempts: 3,
  },
});

const { getSync, updateSyncState, logSyncStart, logSyncFinish } = proxyActivities<ReturnType<typeof createActivities>>({
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

export const RUN_SYNC_PREFIX = 'run-sync-';
export const getRunSyncScheduleId = (syncId: string): string => `${RUN_SYNC_PREFIX}${syncId}`;
export const getRunSyncWorkflowId = (syncId: string): string => `${RUN_SYNC_PREFIX}${syncId}`;

export type RunSyncArgs = {
  syncId: string;
  connectionId: string;
};

export async function runSync({ syncId, connectionId }: RunSyncArgs): Promise<void> {
  const historyIdsMap = Object.fromEntries(
    CRM_COMMON_MODELS.map((commonModel) => {
      const entry: [CommonModel, string] = [commonModel, uuid4()];
      return entry;
    })
  ) as Record<CommonModel, string>;

  await Promise.all(
    CRM_COMMON_MODELS.map(async (commonModel) => {
      await logSyncStart({ syncId, historyId: historyIdsMap[commonModel], commonModel });
    })
  );

  // Read sync from DB
  const { sync } = await getSync({ syncId });

  let numRecordsSyncedMap: Record<CommonModel, number> | undefined;
  try {
    // Figure out what to do based on sync strategy
    switch (sync.type) {
      case 'full then incremental':
        numRecordsSyncedMap = await doFullThenIncrementalSync({ sync });
        break;
      case 'reverse then forward':
        numRecordsSyncedMap = await doReverseThenForwardSync({ sync });
        break;
    }
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    await Promise.all(
      CRM_COMMON_MODELS.map(async (commonModel) => {
        await logSyncFinish({
          syncId,
          connectionId,
          historyId: historyIdsMap[commonModel],
          status: 'FAILURE',
          errorMessage,
        });
        await maybeSendSyncFinishWebhook({
          historyId: historyIdsMap[commonModel],
          status: 'SYNC_ERROR',
          connectionId,
          // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
          numRecordsSynced: 0,
          commonModel,
          errorMessage,
        });
      })
    );

    throw err;
  }

  if (!numRecordsSyncedMap) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRecordsSyncedMap was not set');
  }

  await Promise.all(
    CRM_COMMON_MODELS.map(async (commonModel) => {
      await logSyncFinish({ syncId, connectionId, historyId: historyIdsMap[commonModel], status: 'SUCCESS' });
      await maybeSendSyncFinishWebhook({
        historyId: historyIdsMap[commonModel],
        status: 'SYNC_SUCCESS',
        connectionId,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore `numRecordsSyncedMap` is indeed defined here
        numRecordsSynced: numRecordsSyncedMap[commonModel],
        commonModel,
      });
    })
  );
}

async function doFullThenIncrementalSync({
  sync,
}: {
  sync: FullThenIncrementalSync;
}): Promise<Record<CommonModel, number>> {
  async function doFullStage(): Promise<Record<CommonModel, number>> {
    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'in progress',
        maxLastModifiedAtMsMap: defaultMaxLastModifiedAtMsMap,
      },
    });

    const importRecordsResultList = Object.fromEntries(
      await Promise.all(
        CRM_COMMON_MODELS.map(async (commonModel) => {
          const entry: [CommonModel, ImportRecordsResult] = [
            commonModel,
            await importRecords({ syncId: sync.id, connectionId: sync.connectionId, commonModel }),
          ];
          return entry;
        })
      )
    ) as Record<CommonModel, ImportRecordsResult>;

    const newMaxLastModifiedAtMsMap = {
      account: importRecordsResultList['account'].maxLastModifiedAtMs,
      lead: importRecordsResultList['lead'].maxLastModifiedAtMs,
      opportunity: importRecordsResultList['opportunity'].maxLastModifiedAtMs,
      contact: importRecordsResultList['contact'].maxLastModifiedAtMs,
      user: importRecordsResultList['user'].maxLastModifiedAtMs,
      event: importRecordsResultList['event'].maxLastModifiedAtMs,
    };

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'in progress',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
      },
    });

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'done',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
      },
    });

    return Object.fromEntries(
      CRM_COMMON_MODELS.map((commonModel) => [commonModel, importRecordsResultList[commonModel].numRecordsSynced])
    ) as Record<CommonModel, number>;
  }

  async function doIncrementalPhase(): Promise<Record<CommonModel, number>> {
    function getOriginalMaxLastModifiedAtMsMap(): Record<CommonModel, number> {
      // TODO: we shouldn't need to do this, since it's not possible to
      // start the incremental phase if the full phase hasn't been completed.
      if (sync.state.phase === 'created') {
        return defaultMaxLastModifiedAtMsMap;
      }

      // When we add a new common model, the old maxLastModifiedAtMsMap will be missing fields. We
      // need to pull in the defaultMaxLastModifiedAtMsMap
      return {
        account: sync.state.maxLastModifiedAtMsMap['account'] ?? defaultMaxLastModifiedAtMsMap['account'],
        lead: sync.state.maxLastModifiedAtMsMap['lead'] ?? defaultMaxLastModifiedAtMsMap['lead'],
        opportunity: sync.state.maxLastModifiedAtMsMap['opportunity'] ?? defaultMaxLastModifiedAtMsMap['opportunity'],
        contact: sync.state.maxLastModifiedAtMsMap['contact'] ?? defaultMaxLastModifiedAtMsMap['contact'],
        user: sync.state.maxLastModifiedAtMsMap['user'] ?? defaultMaxLastModifiedAtMsMap['user'],
        event: sync.state.maxLastModifiedAtMsMap['event'] ?? defaultMaxLastModifiedAtMsMap['event'],
      };
    }

    function computeUpdatedMaxLastModifiedAtMsMap(
      importRecordsResultList: Record<CommonModel, ImportRecordsResult>
    ): Record<CommonModel, number> {
      const originalMaxLastModifiedAtMsMap = getOriginalMaxLastModifiedAtMsMap();

      return Object.fromEntries(
        CRM_COMMON_MODELS.map((commonModel) => [
          commonModel,
          Math.max(
            originalMaxLastModifiedAtMsMap[commonModel],
            importRecordsResultList[commonModel].maxLastModifiedAtMs
          ),
        ])
      ) as Record<CommonModel, number>;
    }

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'incremental',
        status: 'in progress',
        maxLastModifiedAtMsMap: getOriginalMaxLastModifiedAtMsMap(),
      },
    });

    const importRecordsResultList = Object.fromEntries(
      await Promise.all(
        CRM_COMMON_MODELS.map(async (commonModel) => {
          const entry: [CommonModel, ImportRecordsResult] = [
            commonModel,
            await importRecords({
              syncId: sync.id,
              connectionId: sync.connectionId,
              commonModel,
              updatedAfterMs: getOriginalMaxLastModifiedAtMsMap()[commonModel],
            }),
          ];
          return entry;
        })
      )
    ) as Record<CommonModel, ImportRecordsResult>;

    const newMaxLastModifiedAtMsMap = computeUpdatedMaxLastModifiedAtMsMap(importRecordsResultList);

    // TODO: Bring this back when we fix https://github.com/supaglue-labs/supaglue/issues/644
    // await updateSyncState({
    //   syncId: sync.id,
    //   state: {
    //     phase: 'incremental',
    //     status: 'in progress',
    //     maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
    //   },
    // });

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'incremental',
        status: 'done',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
      },
    });

    return Object.fromEntries(
      CRM_COMMON_MODELS.map((commonModel) => [commonModel, importRecordsResultList[commonModel].numRecordsSynced])
    ) as Record<CommonModel, number>;
  }

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

async function doReverseThenForwardSync({
  sync,
}: {
  sync: ReverseThenForwardSync;
}): Promise<Record<CommonModel, number>> {
  throw ApplicationFailure.nonRetryable('reverse then forward sync not currently supported');
}

const defaultMaxLastModifiedAtMsMap = {
  account: 0,
  lead: 0,
  opportunity: 0,
  contact: 0,
  user: 0,
  event: 0,
};

const getErrorMessage = (err: Error): string => {
  if (err instanceof ActivityFailure) {
    return err.failure?.cause?.message ?? 'Unknown error';
  }
  if (err instanceof ApplicationFailure) {
    return err.failure?.message ?? 'Unknown error';
  }
  return err.message ?? 'Unknown error';
};
