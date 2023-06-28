import { PaginationInternalParams, SyncInfoFilter } from './';
import { ObjectType } from './object_sync';

export type ObjectSyncRunStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type ObjectSyncRun = {
  id: string;
  objectSyncId: string;
  status: ObjectSyncRunStatus;
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

export type ObjectSyncRunUpsertParams = {
  status: ObjectSyncRunStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
};

export type ObjectSyncRunFilter = SyncInfoFilter & {
  objectType: ObjectType;
  object: string;
  paginationParams: PaginationInternalParams;
};
