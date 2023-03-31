import { Connection as ConnectionModel, SyncHistory as SyncHistoryModel } from '@supaglue/db';

export type SyncHistoryModelExpanded = SyncHistoryModel & {
  sync: {
    id: string;
    connection: ConnectionModel;
  };
};
