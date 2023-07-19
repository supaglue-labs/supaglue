import type { CommonObjectType } from '.';
import type { ObjectSyncType } from './object_sync';

export type SyncConfig = {
  id: string;
  applicationId: string;
  destinationId: string;
  providerId: string;
  config: SyncConfigData;
};

export type SyncConfigCreateParams = Omit<SyncConfig, 'id'>;
// TODO: only `config` should be updatable
export type SyncConfigUpdateParams = Omit<SyncConfigCreateParams, 'applicationId'>;

export type SyncConfigData = {
  defaultConfig: SyncStrategyConfig;
  commonObjects?: CommonObjectConfig[];
  standardObjects?: StandardObjectConfig[];
  customObjects?: CustomObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: ObjectSyncType;
  // default: true
  autoStartOnConnection?: boolean;
};

export type CommonObjectConfig = {
  object: CommonObjectType;
};

export type StandardObjectConfig = {
  object: string;
};

export type CustomObjectConfig = {
  object: string;
};
