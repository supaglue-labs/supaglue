import { CommonModel } from '@supaglue/core/types/common';
import { CRM_COMMON_MODELS } from '@supaglue/core/types/crm';
import { FullThenIncrementalSync, ReverseThenForwardSync } from '@supaglue/core/types/sync';
import { ApplicationFailure, proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type { createActivities } from '../activities';
import { ImportRecordsResult } from '../activities/import_records';

const { importRecords, populateAssociations } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '30 seconds',
});

const { getSync, updateSyncState, logSyncStart, logSyncFinish, maybeSendSyncFinishWebhook } = proxyActivities<
  ReturnType<typeof createActivities>
>({
  startToCloseTimeout: '30 second',
});

export const getRunSyncsScheduleId = (syncId: string): string => `run-syncs-${syncId}`;
export const getRunSyncsWorkflowId = (syncId: string): string => `run-syncs-${syncId}`;

export type RunSyncsArgs = {
  syncId: string;
  connectionId: string;
};

export async function runSyncs({ syncId, connectionId }: RunSyncsArgs): Promise<void> {
  // TODO: Re-do the sync logs now that a single "Sync" is for all common models together.
  const historyIdsMap = Object.fromEntries(
    await Promise.all(
      CRM_COMMON_MODELS.map(async (commonModel) => {
        const entry: [CommonModel, number] = [commonModel, await logSyncStart({ connectionId, commonModel })];
        return entry;
      })
    )
  ) as Record<CommonModel, number>;

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
    await Promise.all(
      CRM_COMMON_MODELS.map(async (commonModel) => {
        await logSyncFinish({
          historyId: historyIdsMap[commonModel],
          status: 'FAILURE',
          errorMessage: err.message ?? 'Unknown error',
        });
        await maybeSendSyncFinishWebhook({
          historyId: historyIdsMap[commonModel],
          status: 'SYNC_ERROR',
          connectionId,
          // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
          numRecordsSynced: 0,
          commonModel,
          errorMessage: err.message ?? 'Unknown error',
        });
      })
    );

    return;
  }

  if (!numRecordsSyncedMap) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRecordsSyncedMap was not set');
  }

  await Promise.all(
    CRM_COMMON_MODELS.map(async (commonModel) => {
      await logSyncFinish({ historyId: historyIdsMap[commonModel], status: 'SUCCESS' });
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
        maxLastModifiedAtMsMap: {
          account: 0,
          lead: 0,
          opportunity: 0,
          contact: 0,
          user: 0,
        },
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
    };

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'in progress',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
      },
    });

    await populateAssociations({ connectionId: sync.connectionId });

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
        return {
          account: 0,
          lead: 0,
          opportunity: 0,
          contact: 0,
          user: 0,
        };
      }

      return sync.state.maxLastModifiedAtMsMap;
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

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'incremental',
        status: 'in progress',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
      },
    });

    await populateAssociations({ connectionId: sync.connectionId });

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
