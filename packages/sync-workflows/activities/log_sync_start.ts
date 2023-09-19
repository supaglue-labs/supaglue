import type { SyncRunService } from '@supaglue/core/services/sync_run_service';

export type LogSyncStartArgs = {
  syncId: string;
  runId: string;
  connectionId: string;
};

export function createLogSyncStart({ syncRunService }: { syncRunService: SyncRunService }) {
  return async function logSyncStart(args: LogSyncStartArgs) {
    return syncRunService.logStart(args);
  };
}
