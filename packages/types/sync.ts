import { CRMCommonModelType } from './crm';
import { EngagementCommonModelType } from './engagement';

type BaseSync = {
  id: string;
  connectionId: string;
  // TODO: This should be required
  syncConfigId?: string;
  forceSyncFlag: boolean; // flag: whether to transition a sync to the phase "created"
  version: 'v1' | 'v2';
};

export type FullThenIncrementalSync = BaseSync & {
  type: 'full then incremental';
  state: FullThenIncrementalSyncState;
};

export type FullOnlySync = BaseSync & {
  type: 'full only';
  state: FullOnlySyncState;
};

export type SyncType = 'full then incremental' | 'full only';
export type Sync = FullThenIncrementalSync | FullOnlySync;

export type CRMNumRecordsSyncedMap = Record<CRMCommonModelType, number>;
export type EngagementNumRecordsSyncedMap = Record<EngagementCommonModelType, number>;
export type NumRecordsSyncedMap = CRMNumRecordsSyncedMap | EngagementNumRecordsSyncedMap;

export type FullOnlySyncStateCreatedPhase = {
  phase: 'created';
};

export type FullOnlySyncStateLivePhase = {
  phase: 'full';
  status: 'in progress' | 'done';
};

export type FullOnlySyncState = FullOnlySyncStateCreatedPhase | FullOnlySyncStateLivePhase;

export type FullThenIncrementalSyncStateCreatedPhase = {
  phase: 'created';
};
export type FullThenIncrementalSyncStateLivePhase = {
  phase: 'full' | 'incremental';
  status: 'in progress' | 'done';
  maxLastModifiedAtMsMap: NumRecordsSyncedMap;
};
export type FullThenIncrementalSyncState =
  | FullThenIncrementalSyncStateCreatedPhase
  | FullThenIncrementalSyncStateLivePhase;

export type SyncState = FullThenIncrementalSyncState | FullOnlySyncState;

// The triplet of customer-provided identifiers to uniquely identify a sync. @todo: use this elsewhere.
export type SyncIdentifier = {
  applicationId: string;
  externalCustomerId: string;
  providerName: string;
};
