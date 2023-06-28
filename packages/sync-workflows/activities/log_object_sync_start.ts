import { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import { ObjectType } from '@supaglue/types/object_sync';

export type LogObjectSyncStartArgs = {
  objectSyncId: string;
  runId: string;
  objectType: ObjectType;
  object: string;
};

export function createLogObjectSyncStart({ objectSyncRunService }: { objectSyncRunService: ObjectSyncRunService }) {
  return async function logObjectSyncStart(args: LogObjectSyncStartArgs) {
    return objectSyncRunService.logStart(args);
  };
}
