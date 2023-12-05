import type { ObjectSync, ObjectSyncDTO, RelatedSyncStates } from '@supaglue/types/sync';

export function generateRelatedObjectSyncStates(
  syncs: (ObjectSyncDTO | ObjectSync)[]
): Record<string, RelatedSyncStates> {
  return syncs.reduce(
    (acc, sync) => {
      let syncedRecordsUpToWatermark = 0;

      if (sync.strategyType === 'full then incremental' && sync.state.phase !== 'created') {
        syncedRecordsUpToWatermark = sync.state.maxLastModifiedAtMs ?? 0;
      } else {
        syncedRecordsUpToWatermark = Date.now(); // synthetic watermark for "full only" sync strategies
      }

      acc[sync.object] = {
        strategyType: sync.strategyType,
        object: sync.object,
        objectType: sync.objectType,
        finished: sync.state.phase === 'created' ? false : sync.state.status === 'done',
        syncedRecordsUpToWatermark,
      };

      return acc;
    },
    {} as Record<string, RelatedSyncStates>
  );
}
