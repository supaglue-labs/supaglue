import type { PaginationInternalParams } from '.';
import type { ObjectType } from './sync';

export type SyncRunStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncRun = {
  id: string;
  syncId: string;
  status: SyncRunStatus;
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

export type ObjectSyncRunWithObject = SyncRun & {
  objectType: ObjectType;
  object: string;
};

export type EntitySyncRunWithEntity = SyncRun & {
  entityId: string;
};

export type SyncRunWithObjectOrEntity = ObjectSyncRunWithObject | EntitySyncRunWithEntity;

export type SyncRunUpsertParams = {
  status: SyncRunStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
};

export type SyncRunFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
  paginationParams: PaginationInternalParams;
} & (
  | {
      objectType: ObjectType;
      object: string;
    }
  | {
      entityId: string;
    }
);
