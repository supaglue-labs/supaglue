import { SyncHistoryService } from '@supaglue/core/services';

export type LogSyncStartArgs = {
  syncId: string;
  historyId: string;
} & (
  | {
      commonModel: string;
    }
  | {
      rawObject: string;
    }
);

export function createLogSyncStart({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncStart(args: LogSyncStartArgs) {
    return syncHistoryService.logStart(args);
  };
}
