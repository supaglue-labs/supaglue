import { PaginationInternalParams, SyncInfoFilter } from './';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistory = {
  id: string;
  syncId: string;
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
  numRecordsSynced: number | null;
};

export type SyncHistoryUpsertParams = {
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
};

export type SyncHistoryFilter = SyncInfoFilter & {
  paginationParams: PaginationInternalParams;
  model?: string;
};
