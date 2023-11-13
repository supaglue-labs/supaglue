import type { ProviderName } from './';
import type { SyncStrategyType } from './sync';
import type { CommonObjectConfig, CustomObjectConfig, StandardObjectConfig } from './sync_object_config';

export type SyncConfig = {
  id: string;
  applicationId: string;
  destinationId: string;
  providerId: string;
  config: SyncConfigData;
};

export type SyncConfigCreateParams = Omit<SyncConfig, 'id' | 'destinationId' | 'providerId'> & {
  destinationName: string;
  providerName: ProviderName;
};
// TODO: only `config` should be updatable
export type SyncConfigUpdateParams = Omit<SyncConfigCreateParams, 'applicationId' | 'destinationName' | 'providerName'>;

export type SyncConfigData = {
  defaultConfig: SyncStrategyConfig;
  commonObjects?: CommonObjectConfig[];
  standardObjects?: StandardObjectConfig[];
  entities?: {
    entityId: string;
  }[];
  customObjects?: CustomObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncStrategyType;
  // Only applicable if strategy is set to incremental. If set, it will perform a full sync after N consecutive incremental syncs.
  fullSyncEveryNIncrementals?: number;
  // default: true
  autoStartOnConnection?: boolean;
};
