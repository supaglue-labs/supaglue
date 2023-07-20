import type { PaginationInternalParams } from '.';

export type EntitySyncRunStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type EntitySyncRun = {
  id: string;
  entitySyncId: string;
  status: EntitySyncRunStatus;
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

export type EntitySyncRunWithEntity = EntitySyncRun & {
  entityId: string;
};

export type EntitySyncRunUpsertParams = {
  status: EntitySyncRunStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  numRecordsSynced: number | null;
};

export type EntitySyncRunFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
  entityId?: string;
  paginationParams: PaginationInternalParams;
};
