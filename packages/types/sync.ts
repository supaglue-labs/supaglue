import { CRMCommonModelType } from './crm';
import { EngagementCommonModelType } from './engagement';

type BaseSync = {
  id: string;
  connectionId: string;
  // TODO: This should be required
  syncConfigId?: string;
  forceSyncFlag: boolean; // flag: whether to transition a sync to the phase "created"
  paused: boolean;
  schemaMappingsConfig?: SchemaMappingsConfig;
};

export type SchemaMappingsConfig = {
  standardObjects?: SchemaMappingsConfigStandardObject[];
};

export type SchemaMappingsConfigStandardObject = {
  object: string;
  fieldMappings: SchemaMappingsConfigStandardObjectFieldMapping[];
};

export type SchemaMappingsConfigStandardObjectFieldMapping = {
  schemaField: string; // my_first_column
  mappedField: string; // blah_1
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

export type SyncCreateParams = {
  schemaMappingsConfig?: SchemaMappingsConfig;
};

export type SyncUpdateParams = {
  schemaMappingsConfig?: SchemaMappingsConfig | null;
};

export type CRMNumCommonRecordsSyncedMap = {
  [K in CRMCommonModelType]?: number;
};
export type EngagementNumCommonRecordsSyncedMap = {
  [K in EngagementCommonModelType]?: number;
};
export type NumCommonRecordsSyncedMap = CRMNumCommonRecordsSyncedMap | EngagementNumCommonRecordsSyncedMap;
export type NumRawRecordsSyncedMap = Record<string, number>;

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
  // for common models
  maxLastModifiedAtMsMap: NumCommonRecordsSyncedMap;
  maxLastModifedAtMsMapForRawObjects?: Record<string, number>;
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
