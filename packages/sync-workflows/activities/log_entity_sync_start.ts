import type { EntitySyncRunService } from '@supaglue/core/services/entity_sync_run_service';

export type LogEntitySyncStartArgs = {
  entitySyncId: string;
  runId: string;
  entityId: string;
};

export function createLogEntitySyncStart({ entitySyncRunService }: { entitySyncRunService: EntitySyncRunService }) {
  return async function logEntitySyncStart(args: LogEntitySyncStartArgs) {
    return entitySyncRunService.logStart(args);
  };
}
