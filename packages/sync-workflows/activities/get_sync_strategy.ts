import type { SyncRunService } from '@supaglue/core/services/sync_run_service';
import type { Sync } from '@supaglue/types/sync';

export type GetSyncStrategyArgs = {
  sync: Sync;
};

export function createGetSyncStrategy(syncRunService: SyncRunService) {
  return async function getSyncStrategy({ sync }: GetSyncStrategyArgs): Promise<'full' | 'incremental'> {
    if (sync.strategyType === 'full only') {
      return 'full';
    }

    // Short-circuit normal state transitions if we're forcing a full refresh sync
    if (sync.argsForNextRun?.performFullRefresh) {
      return 'full';
    }

    // Sync state transitions
    switch (sync.state.phase) {
      case 'created':
        return 'full';
      case 'full':
        switch (sync.state.status) {
          case 'in progress':
            return 'full';
          case 'done':
            return (await shouldDoFullSyncAfterNIncrementals(sync)) ? 'full' : 'incremental';
        }
        break;
      case 'incremental':
        return (await shouldDoFullSyncAfterNIncrementals(sync)) ? 'full' : 'incremental';
    }
  };

  async function shouldDoFullSyncAfterNIncrementals(sync: Sync): Promise<boolean> {
    // This function is not applicable for entity syncs or full-only syncs
    if (sync.type === 'entity' || sync.strategyType !== 'full then incremental') {
      return false;
    }
    if (!sync.fullSyncEveryNIncrementals) {
      return false;
    }
    return await syncRunService.lastNRunsAreAllIncremental(sync, sync.fullSyncEveryNIncrementals);
  }
}
