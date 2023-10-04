import type { PaginationInternalParams } from '.';

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
  type: 'object';
  objectType: 'common' | 'standard' | 'custom';
  object: string;
};

export type EntitySyncRunWithEntity = SyncRun & {
  type: 'entity';
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
  status?: SyncRunStatus;
  startTimestamp?: SyncRunTimestampFilter;
  endTimestamp?: SyncRunTimestampFilter;
  paginationParams: PaginationInternalParams;

  // we let the user filter on any attribute without enforcing related pairs to exist, so these are all optional
  objectType?: 'common' | 'standard' | 'custom';
  object?: string;
  entityId?: string;
};

export type SyncRunTimestampFilter =
  | {
      gt: Date;
    }
  | {
      lt: Date;
    };
