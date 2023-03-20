import { Connection as ConnectionModel, SyncHistory as SyncHistoryModel } from '@supaglue/db';
import { SyncInfoFilter } from './';
import { PaginationParams } from './common';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistoryModelExpanded = SyncHistoryModel & {
  connection: ConnectionModel;
};

export type SyncHistory = {
  id: number;
  modelName: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  applicationId: string;
  // External Id
  customerId: string;
  providerName: string;
  category: 'crm';
  connectionId: string;
};

export type SyncHistoryCreateParams = {
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
};

export type SyncHistoryFilter = SyncInfoFilter & {
  paginationParams: PaginationParams;
  model?: string;
};
