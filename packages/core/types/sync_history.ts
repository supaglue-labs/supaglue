import { Connection as ConnectionModel, SyncHistory as SyncHistoryModel } from '@supaglue/db';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistoryModelExpanded = SyncHistoryModel & {
  connection: ConnectionModel;
};

export type SyncHistory = {
  id: number;
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  customerId: string;
  providerName: string;
  category: string;
  connectionId: string;
};

export type SyncHistoryCreateParams = {
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
};
