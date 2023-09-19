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
  objectType?: string;
  object?: string;
  syncType?: string;
  entityId?: string;
};

export type SyncRunFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
  status?: SyncRunStatus;
  startTimestamp?: SyncRunTimestampFilter;
  endTimestamp?: SyncRunTimestampFilter;
  paginationParams: PaginationInternalParams;
} & (
  | {
      objectType: 'common' | 'standard' | 'custom';
      object: string;
    }
  | {
      entityId: string;
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}
);

export type SyncRunTimestampFilter =
  | {
      gt: Date;
    }
  | {
      lt: Date;
    };
