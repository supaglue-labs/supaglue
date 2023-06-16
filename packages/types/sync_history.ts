import { PaginationInternalParams, SyncInfoFilter } from './';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistory = {
  id: string;
  syncId: string;
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
} & (
  | {
      modelName: string;
    }
  | {
      rawObject: string;
    }
);

export type SyncHistoryUpsertParams = {
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
} & (
  | {
      model: string;
    }
  | {
      rawObject: string;
    }
);

export type SyncHistoryFilter = SyncInfoFilter & {
  paginationParams: PaginationInternalParams;
} & (
    | {
        model?: string;
      }
    | {
        rawObject?: string;
      }
  );
