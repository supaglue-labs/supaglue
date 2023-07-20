import type { Connection as ConnectionModel, SyncRun as SyncRunModel } from '@supaglue/db';

export type SyncRunModelExpanded = SyncRunModel & {
  sync: {
    id: string;
    connection: ConnectionModel;
  };
};

export type SyncRunModelExpandedWithObjectAndEntity = SyncRunModelExpanded & {
  sync: {
    objectType: string | null;
    object: string | null;
    entityId: string | null;
  };
};
