import { CommonModelType, ProviderCategory } from '@supaglue/types/common';
import { CRMCommonModelType } from '@supaglue/types/crm';
import {
  FullOnlySync,
  FullThenIncrementalSync,
  NumCommonRecordsSyncedMap,
  NumRawRecordsSyncedMap,
} from '@supaglue/types/sync';
import { ActivityFailure, ApplicationFailure, proxyActivities, uuid4 } from '@temporalio/workflow';
// Only import the activity types
import { SyncConfig } from '@supaglue/types';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import type { createActivities } from '../activities/index';
import { SyncRawRecordsToDestinationResult } from '../activities/sync_raw_records_to_destination';
import { SyncRecordsToDestinationResult } from '../activities/sync_records_to_destination';

const { syncRecordsToDestination, syncRawRecordsToDestination } = proxyActivities<ReturnType<typeof createActivities>>({
  startToCloseTimeout: '120 minute',
  heartbeatTimeout: '15 minute',
  retry: {
    maximumAttempts: 3,
  },
});

const {
  getSync,
  getSyncConfigBySyncId,
  getDestination,
  updateSyncState,
  logSyncStart,
  logSyncFinish,
  setForceSyncFlag,
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

export const RUN_MANAGED_SYNC_PREFIX = 'run-managed-sync-';
export const getRunManagedSyncScheduleId = (syncId: string): string => `${RUN_MANAGED_SYNC_PREFIX}${syncId}`;
export const getRunManagedSyncWorkflowId = (syncId: string): string => `${RUN_MANAGED_SYNC_PREFIX}${syncId}`;

export type RunManagedSyncArgs = {
  syncId: string;
  connectionId: string;
  category: ProviderCategory;
  context: Record<string, unknown>;
};

export async function runManagedSync({ syncId, connectionId, category }: RunManagedSyncArgs): Promise<void> {
  // Where are we syncing to?
  const { destination } = await getDestination({ syncId });
  if (!destination) {
    return;
  }

  // What are we syncing?
  const { syncConfig } = await getSyncConfigBySyncId({ syncId });
  const { commonObjects = [], standardObjects = [], customObjects = [] } = syncConfig.config;
  const objects = [...standardObjects, ...customObjects];

  // What is the sync type?
  const { sync } = await getSync({ syncId });

  // TODO: Validate that the commonObjects are valid in this category?
  const commonObjectHistoryIdsMap = Object.fromEntries(
    commonObjects.map((commonObject) => {
      const entry: [CommonModelType, string] = [commonObject.object, uuid4()];
      return entry;
    })
  );
  const objectHistoryIdsMap = Object.fromEntries(
    objects.map((object) => {
      const entry: [string, string] = [object.object, uuid4()];
      return entry;
    })
  );

  // Record that syncs have started
  await Promise.all(
    commonObjects.map(async (commonObject) => {
      await logSyncStart({
        syncId,
        historyId: commonObjectHistoryIdsMap[commonObject.object],
        commonModel: commonObject.object,
      });
    })
  );
  await Promise.all(
    objects.map(async (object) => {
      await logSyncStart({
        syncId,
        historyId: objectHistoryIdsMap[object.object],
        rawObject: object.object,
      });
    })
  );

  let numCommonRecordsSyncedMap: NumCommonRecordsSyncedMap | undefined;
  let numRawRecordsSyncedMap: NumRawRecordsSyncedMap | undefined;
  try {
    // Figure out what to do based on sync strategy
    switch (sync.type) {
      case 'full then incremental':
        ({ numCommonRecordsSyncedMap, numRawRecordsSyncedMap } = await doFullThenIncrementalSync({
          sync,
          syncConfig,
          category,
        }));
        break;
      case 'full only':
        ({ numCommonRecordsSyncedMap, numRawRecordsSyncedMap } = await doFullOnlySync({ sync, syncConfig, category }));
        break;
      default:
        throw new Error('Sync type not supported.');
    }
  } catch (err: any) {
    const { message: errorMessage, stack: errorStack } = getErrorMessageStack(err);

    await Promise.all(
      commonObjects.map(async ({ object: commonModel }) => {
        await logSyncFinish({
          syncId,
          connectionId,
          historyId: commonObjectHistoryIdsMap[commonModel],
          status: 'FAILURE',
          errorMessage,
          errorStack,
          numRecordsSynced: null,
        });
        await maybeSendSyncFinishWebhook({
          historyId: commonObjectHistoryIdsMap[commonModel],
          status: 'SYNC_ERROR',
          connectionId,
          // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
          numRecordsSynced: 0,
          commonModel,
          errorMessage,
        });
      })
    );

    await Promise.all(
      objects.map(async ({ object }) => {
        await logSyncFinish({
          syncId,
          connectionId,
          historyId: objectHistoryIdsMap[object],
          status: 'FAILURE',
          errorMessage,
          errorStack,
          numRecordsSynced: null,
        });
        await maybeSendSyncFinishWebhook({
          historyId: objectHistoryIdsMap[object],
          status: 'SYNC_ERROR',
          connectionId,
          // TODO: This is potentially inaccurate. Maybe the activity should still return a result if it fails in the middle.
          numRecordsSynced: 0,
          rawObject: object,
          errorMessage,
        });
      })
    );

    throw err;
  }

  if (!numCommonRecordsSyncedMap) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numCommonRecordsSyncedMap was not set');
  }

  if (!numRawRecordsSyncedMap) {
    throw ApplicationFailure.nonRetryable('Unexpectedly numRawRecordsSyncedMap was not set');
  }

  await Promise.all(
    commonObjects.map(async ({ object: commonModel }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore `numCommonRecordsSyncedMap` is indeed defined here
      const numRecordsSynced = numCommonRecordsSyncedMap[commonModel];

      await logSyncFinish({
        syncId,
        connectionId,
        historyId: commonObjectHistoryIdsMap[commonModel],
        status: 'SUCCESS',
        numRecordsSynced,
      });
      await maybeSendSyncFinishWebhook({
        historyId: commonObjectHistoryIdsMap[commonModel],
        status: 'SYNC_SUCCESS',
        connectionId,
        numRecordsSynced,
        commonModel,
      });
    })
  );

  await Promise.all(
    objects.map(async ({ object }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore `numRawRecordsSyncedMap` is indeed defined here
      const numRecordsSynced = numRawRecordsSyncedMap[object];

      await logSyncFinish({
        syncId,
        connectionId,
        historyId: objectHistoryIdsMap[object],
        status: 'SUCCESS',
        numRecordsSynced,
      });
      await maybeSendSyncFinishWebhook({
        historyId: objectHistoryIdsMap[object],
        status: 'SYNC_SUCCESS',
        connectionId,
        numRecordsSynced,
        rawObject: object,
      });
    })
  );
}

async function doFullOnlySync({
  sync,
  syncConfig: {
    config: { commonObjects = [], standardObjects = [], customObjects = [] },
  },
  category,
}: {
  sync: FullOnlySync;
  syncConfig: SyncConfig;
  category: ProviderCategory;
}): Promise<{ numCommonRecordsSyncedMap: NumCommonRecordsSyncedMap; numRawRecordsSyncedMap: NumRawRecordsSyncedMap }> {
  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'full',
      status: 'in progress',
    },
  });

  const syncRecordsToDestinationResultList = Object.fromEntries(
    await Promise.all(
      commonObjects.map(async ({ object: commonModel }) => {
        const entry: [CommonModelType, SyncRecordsToDestinationResult] = [
          commonModel,
          await syncRecordsToDestination({ syncId: sync.id, connectionId: sync.connectionId, commonModel }),
        ];
        return entry;
      })
    )
  );

  const syncRawRecordsToDestinationResultList = Object.fromEntries(
    await Promise.all([
      ...standardObjects.map(async ({ object }) => {
        const entry: [string, SyncRawRecordsToDestinationResult] = [
          object,
          await syncRawRecordsToDestination({
            syncId: sync.id,
            connectionId: sync.connectionId,
            object,
            isCustom: false,
          }),
        ];
        return entry;
      }),
      ...customObjects.map(async ({ object }) => {
        const entry: [string, SyncRawRecordsToDestinationResult] = [
          object,
          await syncRawRecordsToDestination({
            syncId: sync.id,
            connectionId: sync.connectionId,
            object,
            isCustom: true,
          }),
        ];
        return entry;
      }),
    ])
  );

  await updateSyncState({
    syncId: sync.id,
    state: {
      phase: 'full',
      status: 'done',
    },
  });

  const numCommonRecordsSyncedMap = Object.fromEntries(
    commonObjects.map(({ object: commonModel }) => [
      commonModel,
      syncRecordsToDestinationResultList[commonModel].numRecordsSynced,
    ])
  ) as NumCommonRecordsSyncedMap; // TODO: better types
  const numRawRecordsSyncedMap = Object.fromEntries(
    standardObjects.map(({ object }) => [object, syncRawRecordsToDestinationResultList[object].numRecordsSynced])
  ) as Record<string, number>;

  return {
    numCommonRecordsSyncedMap,
    numRawRecordsSyncedMap,
  };
}

async function doFullThenIncrementalSync({
  sync,
  syncConfig: {
    config: { commonObjects = [], standardObjects = [], customObjects = [] },
  },
  category,
}: {
  sync: FullThenIncrementalSync;
  syncConfig: SyncConfig;
  category: ProviderCategory;
}): Promise<{ numCommonRecordsSyncedMap: NumCommonRecordsSyncedMap; numRawRecordsSyncedMap: NumRawRecordsSyncedMap }> {
  async function doFullStage(): Promise<{
    numCommonRecordsSyncedMap: NumCommonRecordsSyncedMap;
    numRawRecordsSyncedMap: NumRawRecordsSyncedMap;
  }> {
    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'in progress',
        maxLastModifiedAtMsMap: {},
        maxLastModifedAtMsMapForRawObjects: {},
      },
    });

    // Sync everything at the same time
    // TODO: Do we really want to do all of these in parallel?
    // Common objects
    const syncRecordsToDestinationResultList = Object.fromEntries(
      await Promise.all(
        commonObjects.map(async ({ object }) => {
          const entry: [CommonModelType, SyncRecordsToDestinationResult] = [
            object,
            await syncRecordsToDestination({ syncId: sync.id, connectionId: sync.connectionId, commonModel: object }),
          ];
          return entry;
        })
      )
    );

    // Raw objects
    const syncRawRecordsToDestinationResultList = Object.fromEntries(
      await Promise.all([
        ...standardObjects.map(async ({ object }) => {
          const entry: [string, SyncRawRecordsToDestinationResult] = [
            object,
            await syncRawRecordsToDestination({
              syncId: sync.id,
              connectionId: sync.connectionId,
              object,
              isCustom: false,
            }),
          ];
          return entry;
        }),
        ...customObjects.map(async ({ object }) => {
          const entry: [string, SyncRawRecordsToDestinationResult] = [
            object,
            await syncRawRecordsToDestination({
              syncId: sync.id,
              connectionId: sync.connectionId,
              object,
              isCustom: true,
            }),
          ];
          return entry;
        }),
      ])
    );

    const newMaxLastModifiedAtMsMap = Object.fromEntries(
      Object.entries(syncRecordsToDestinationResultList).map(([object, { maxLastModifiedAtMs }]) => [
        object,
        maxLastModifiedAtMs,
      ])
    );

    const newMaxLastModifiedAtMsMapForObjects = Object.fromEntries(
      Object.entries(syncRawRecordsToDestinationResultList).map(([object, { maxLastModifiedAtMs }]) => [
        object,
        maxLastModifiedAtMs,
      ])
    );

    // We don't merge with old maxLastModifiedAtMsMap because if we previously were syncing accounts,
    // then stopped, then resumed, we should start from 0 anyway.
    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'full',
        status: 'done',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
        maxLastModifedAtMsMapForRawObjects: newMaxLastModifiedAtMsMapForObjects,
      },
    });

    const numCommonRecordsSyncedMap = Object.fromEntries(
      commonObjects.map(({ object: commonModel }) => [
        commonModel,
        syncRecordsToDestinationResultList[commonModel].numRecordsSynced,
      ])
    ) as NumCommonRecordsSyncedMap; // TODO: better types
    const numRawRecordsSyncedMap = Object.fromEntries(
      standardObjects.map(({ object }) => [object, syncRawRecordsToDestinationResultList[object].numRecordsSynced])
    ) as Record<string, number>;

    return {
      numCommonRecordsSyncedMap,
      numRawRecordsSyncedMap,
    };
  }

  async function doIncrementalPhase(): Promise<{
    numCommonRecordsSyncedMap: NumCommonRecordsSyncedMap;
    numRawRecordsSyncedMap: NumRawRecordsSyncedMap;
  }> {
    function getOriginalMaxLastModifiedAtMsMap(): NumCommonRecordsSyncedMap {
      // we shouldn't need to do this, since it's not possible to
      // start the incremental phase if the full phase hasn't been completed.
      if (sync.state.phase === 'created') {
        return {};
      }

      return sync.state.maxLastModifiedAtMsMap;
    }

    function computeUpdatedMaxLastModifiedAtMsMap(
      syncRecordsToDestinationResultList:
        | Record<CRMCommonModelType, SyncRecordsToDestinationResult>
        | Record<EngagementCommonModelType, SyncRecordsToDestinationResult>
    ): NumCommonRecordsSyncedMap {
      const originalMaxLastModifiedAtMsMap = getOriginalMaxLastModifiedAtMsMap();

      return Object.fromEntries(
        commonObjects.map(({ object: commonModel }) => [
          commonModel,
          Math.max(
            (originalMaxLastModifiedAtMsMap as Record<CommonModelType, number>)[commonModel] ?? 0,
            (syncRecordsToDestinationResultList as Record<CommonModelType, SyncRecordsToDestinationResult>)[commonModel]
              .maxLastModifiedAtMs
          ),
        ])
      ) as NumCommonRecordsSyncedMap;
    }

    function getOriginalMaxLastModifiedAtMsMapForObjects(): NumRawRecordsSyncedMap {
      // we shouldn't need to do this, since it's not possible to
      // start the incremental phase if the full phase hasn't been completed.
      if (sync.state.phase === 'created') {
        return {};
      }

      return sync.state.maxLastModifedAtMsMapForRawObjects ?? {};
    }

    function computeUpdatedMaxLastModifiedAtMsMapForObjects(
      syncRawRecordsToDestinationResultList: Record<string, SyncRawRecordsToDestinationResult>
    ): NumRawRecordsSyncedMap {
      const originalMaxLastModifiedAtMsMap = getOriginalMaxLastModifiedAtMsMapForObjects();

      return Object.fromEntries(
        Object.entries(syncRawRecordsToDestinationResultList).map(([object, { maxLastModifiedAtMs }]) => [
          object,
          Math.max(originalMaxLastModifiedAtMsMap[object] ?? 0, maxLastModifiedAtMs),
        ])
      );
    }

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'incremental',
        status: 'in progress',
        maxLastModifiedAtMsMap: getOriginalMaxLastModifiedAtMsMap(),
        maxLastModifedAtMsMapForRawObjects: getOriginalMaxLastModifiedAtMsMapForObjects(),
      },
    });

    // Sync common objects
    const syncRecordsToDestinationResultList = Object.fromEntries(
      await Promise.all(
        commonObjects.map(async ({ object: commonModel }) => {
          const entry: [CommonModelType, SyncRecordsToDestinationResult] = [
            commonModel,
            await syncRecordsToDestination({
              syncId: sync.id,
              connectionId: sync.connectionId,
              commonModel,
              updatedAfterMs: (getOriginalMaxLastModifiedAtMsMap() as Record<CommonModelType, number>)[commonModel],
            }),
          ];
          return entry;
        })
      )
    ) as Record<CommonModelType, SyncRecordsToDestinationResult>;

    const newMaxLastModifiedAtMsMap = computeUpdatedMaxLastModifiedAtMsMap(syncRecordsToDestinationResultList);

    // Sync raw objects
    const syncRawRecordsToDestinationResultList = Object.fromEntries(
      await Promise.all([
        ...standardObjects.map(async ({ object }) => {
          const entry: [string, SyncRawRecordsToDestinationResult] = [
            object,
            await syncRawRecordsToDestination({
              syncId: sync.id,
              connectionId: sync.connectionId,
              object,
              isCustom: false,
              modifiedAfterMs: getOriginalMaxLastModifiedAtMsMapForObjects()[object],
            }),
          ];
          return entry;
        }),
        ...customObjects.map(async ({ object }) => {
          const entry: [string, SyncRawRecordsToDestinationResult] = [
            object,
            await syncRawRecordsToDestination({
              syncId: sync.id,
              connectionId: sync.connectionId,
              object,
              isCustom: true,
              modifiedAfterMs: getOriginalMaxLastModifiedAtMsMapForObjects()[object],
            }),
          ];
          return entry;
        }),
      ])
    );

    const newMaxLastModifiedAtMsMapForObjects = computeUpdatedMaxLastModifiedAtMsMapForObjects(
      syncRawRecordsToDestinationResultList
    );

    await updateSyncState({
      syncId: sync.id,
      state: {
        phase: 'incremental',
        status: 'done',
        maxLastModifiedAtMsMap: newMaxLastModifiedAtMsMap,
        maxLastModifedAtMsMapForRawObjects: newMaxLastModifiedAtMsMapForObjects,
      },
    });

    const numCommonRecordsSyncedMap = Object.fromEntries(
      commonObjects.map(({ object: commonModel }) => [
        commonModel,
        syncRecordsToDestinationResultList[commonModel].numRecordsSynced,
      ])
    ) as NumCommonRecordsSyncedMap; // TODO: better types
    const numRawRecordsSyncedMap = Object.fromEntries(
      standardObjects.map(({ object }) => [object, syncRawRecordsToDestinationResultList[object].numRecordsSynced])
    ) as Record<string, number>;

    return {
      numCommonRecordsSyncedMap,
      numRawRecordsSyncedMap,
    };
  }

  // Short circuit normal state transitions if we're forcing a sync which will reset the state
  if (sync.forceSyncFlag) {
    const results = await doFullStage();
    await setForceSyncFlag({ syncId: sync.id }, false);
    return results;
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
