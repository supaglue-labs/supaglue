import type { PaginationInternalParams } from './common';

type BaseEntitySync = {
  id: string;
  entityId: string;
  connectionId: string;
  syncConfigId: string;
  paused: boolean;
  argsForNextRun?: {
    performFullRefresh: boolean;
  };
};

export type FullThenIncrementalEntitySync = BaseEntitySync & {
  type: 'full then incremental';
  state: FullThenIncrementalEntitySyncState;
};

export type FullOnlyEntitySync = BaseEntitySync & {
  type: 'full only';
  state: FullOnlyEntitySyncState;
};

export type EntitySyncType = 'full then incremental' | 'full only';
export type EntitySync = FullThenIncrementalEntitySync | FullOnlyEntitySync;

export type EntitySyncDTO = EntitySync & {
  // External Id
  customerId: string;
  providerName: string;
};

export type FullOnlyEntitySyncStateCreatedPhase = {
  phase: 'created';
};

export type FullOnlyEntitySyncStateLivePhase = {
  phase: 'full';
  status: 'in progress' | 'done';
};

export type FullOnlyEntitySyncState = FullOnlyEntitySyncStateCreatedPhase | FullOnlyEntitySyncStateLivePhase;

export type FullThenIncrementalEntitySyncStateCreatedPhase = {
  phase: 'created';
};
export type FullThenIncrementalEntitySyncStateLivePhase = {
  phase: 'full' | 'incremental';
  status: 'in progress' | 'done';
  maxLastModifiedAtMs?: number;
};
export type FullThenIncrementalEntitySyncState =
  | FullThenIncrementalEntitySyncStateCreatedPhase
  | FullThenIncrementalEntitySyncStateLivePhase;

export type EntitySyncState = FullThenIncrementalEntitySyncState | FullOnlyEntitySyncState;

export type EntitySyncFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
  entityId?: string;
  paginationParams: PaginationInternalParams;
};
