import type { PaginationInternalParams } from './common';
import type { SnakecasedKeys } from './snakecased_keys';
import type { SyncConfig } from './sync_config';

export type ObjectType = 'common' | 'standard' | 'custom';

export type ArgsForNextSyncRun = {
  performFullRefresh: boolean;
};

type BaseSync = {
  id: string;
  connectionId: string;
  syncConfigId: string;
  paused: boolean;
  argsForNextRun: ArgsForNextSyncRun | null;
};

export type ObjectSyncArgs = {
  type: 'object';
  objectType: 'common' | 'standard' | 'custom';
  object: string;
};

export type EntitySyncArgs = BaseSync & {
  type: 'entity';
  entityId: string;
};

type FullThenIncrementalSyncArgs = {
  strategyType: 'full then incremental';
  fullSyncEveryNIncrementals?: number;
  state: FullThenIncrementalSyncState;
};

type FullOnlySyncArgs = {
  strategyType: 'full only';
  state: FullOnlySyncState;
};

export type FullThenIncrementalObjectSync = BaseSync & ObjectSyncArgs & FullThenIncrementalSyncArgs;
export type FullOnlyObjectSync = BaseSync & ObjectSyncArgs & FullOnlySyncArgs;
export type FullThenIncrementalEntitySync = BaseSync & EntitySyncArgs & FullThenIncrementalSyncArgs;
export type FullOnlyEntitySync = BaseSync & EntitySyncArgs & FullOnlySyncArgs;

export type SyncStrategyType = 'full then incremental' | 'full only';
export type ObjectSync = FullThenIncrementalObjectSync | FullOnlyObjectSync;
export type EntitySync = FullThenIncrementalEntitySync | FullOnlyEntitySync;
export type FullThenIncrementalSync = FullThenIncrementalObjectSync | FullThenIncrementalEntitySync;
export type FullOnlySync = FullOnlyObjectSync | FullOnlyEntitySync;
export type Sync = ObjectSync | EntitySync;
export type SnakecasedSync = SnakecasedKeys<Sync>;

export type ObjectSyncDTO = Sync & {
  type: 'object';
  // External Id
  customerId: string;
  providerName: string;
};

export type SyncDTO = Sync & {
  // External Id
  customerId: string;
  providerName: string;
};

export type SyncAndSyncConfigDTO = Sync & {
  // External Id
  customerId: string;
  providerName: string;

  syncConfig: SyncConfig; // Note: using SyncConfig b/c it's not easy to pass around the resolved providerName and destinationName. @todo: encapsulate Supaglue concepts into classes
};

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
  maxLastModifiedAtMs?: number;
};
export type FullThenIncrementalSyncState =
  | FullThenIncrementalSyncStateCreatedPhase
  | FullThenIncrementalSyncStateLivePhase;

export type SyncState = FullThenIncrementalSyncState | FullOnlySyncState;

export type SyncFilter = {
  applicationId: string;
  externalCustomerId?: string;
  providerName?: string;
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

export type RelatedSyncStates = {
  strategyType: 'full only' | 'full then incremental';
  finished: boolean;
  object: string;
  objectType: 'common' | 'standard' | 'custom';
  syncedRecordsUpToWatermark: number;
};
