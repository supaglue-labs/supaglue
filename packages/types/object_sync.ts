type BaseObjectSync = {
  id: string;
  connectionId: string;
  syncConfigId: string;
  forceSyncFlag: boolean; // flag: whether to transition a sync to the phase "created"
  paused: boolean;
};

type BaseCommonObjectSync = BaseObjectSync & {
  commonObject: string;
};

type BaseStandardObjectSync = BaseObjectSync & {
  standardObject: string;
};

type BaseCustomObjectSync = BaseObjectSync & {
  customObject: string;
};

type CoreObjectSync = BaseCommonObjectSync | BaseStandardObjectSync | BaseCustomObjectSync;

export type FullThenIncrementalObjectSync = CoreObjectSync & {
  type: 'full then incremental';
  state: FullThenIncrementalObjectSyncState;
};

export type FullOnlyObjectSync = CoreObjectSync & {
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

export type SyncState = FullThenIncrementalObjectSyncState | FullOnlyObjectSyncState;
