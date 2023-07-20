import type { Connection as ConnectionModel, EntitySyncRun as EntitySyncRunModel } from '@supaglue/db';

export type EntitySyncRunModelExpanded = EntitySyncRunModel & {
  entitySync: {
    id: string;
    connection: ConnectionModel;
  };
};

export type EntitySyncRunModelExpandedWithEntity = EntitySyncRunModelExpanded & {
  entitySync: {
    entityId: string;
  };
};
