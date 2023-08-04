import type { CommonObjectType } from '.';
import type { SyncStrategyType } from './sync';

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
  entities?: {
    entityId: string;
  }[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncStrategyType;
  // default: true
  autoStartOnConnection?: boolean;
};

export type CommonObjectConfig = {
  object: CommonObjectType;
};

export type StandardObjectConfig = {
  object: string;
};
