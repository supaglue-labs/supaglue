import type { PaginationInternalParams } from './';
import type { ObjectType } from './object_sync';

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

export type ObjectSyncRunWithObject = ObjectSyncRun & {
  objectType: ObjectType;
  object: string;
};

export type ObjectSyncRunUpsertParams = {
  status: ObjectSyncRunStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
};

export type ObjectSyncRunFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
} & (
  | {
      objectType: ObjectType;
      object: string;
      paginationParams: PaginationInternalParams;
    }
  | {
      paginationParams: PaginationInternalParams;
    }
);
