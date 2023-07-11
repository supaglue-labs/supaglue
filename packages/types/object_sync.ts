import type { PaginationInternalParams } from './common';

export type ObjectType = 'common' | 'standard' | 'custom';

type BaseObjectSync = {
  id: string;
  objectType: ObjectType;
  object: string;
  connectionId: string;
  syncConfigId: string;
  paused: boolean;
  argsForNextRun?: {
    performFullRefresh: boolean;
  };
};

export type FullThenIncrementalObjectSync = BaseObjectSync & {
  type: 'full then incremental';
  state: FullThenIncrementalObjectSyncState;
};

export type FullOnlyObjectSync = BaseObjectSync & {
  type: 'full only';
  state: FullOnlyObjectSyncState;
};

export type ObjectSyncType = 'full then incremental' | 'full only';
export type ObjectSync = FullThenIncrementalObjectSync | FullOnlyObjectSync;

export type FullOnlyObjectSyncStateCreatedPhase = {
  phase: 'created';
};

export type FullOnlyObjectSyncStateLivePhase = {
  phase: 'full';
  status: 'in progress' | 'done';
};

export type FullOnlyObjectSyncState = FullOnlyObjectSyncStateCreatedPhase | FullOnlyObjectSyncStateLivePhase;

export type FullThenIncrementalObjectSyncStateCreatedPhase = {
  phase: 'created';
};
export type FullThenIncrementalObjectSyncStateLivePhase = {
  phase: 'full' | 'incremental';
  status: 'in progress' | 'done';
  maxLastModifiedAtMs?: number;
};
export type FullThenIncrementalObjectSyncState =
  | FullThenIncrementalObjectSyncStateCreatedPhase
  | FullThenIncrementalObjectSyncStateLivePhase;

export type ObjectSyncState = FullThenIncrementalObjectSyncState | FullOnlyObjectSyncState;

export type ObjectSyncFilter = {
  connectionId: string;
} & (
  | {
      objectType: ObjectType;
      object: string;
      paginationParams: PaginationInternalParams;
    }
  | {
      paginationParams: PaginationInternalParams;
    };
);
