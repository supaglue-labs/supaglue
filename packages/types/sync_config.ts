import { SyncType } from '.';

// DEPRECATED: Use SyncConfig instead.
export type IntegrationSyncConfig = {
  periodMs: number;
  syncAllFields?: boolean;
};

export type SyncConfig = {
  id: string;
  applicationId: string;
  destinationId: string;
  providerId: string;
  config: SyncConfigData;
};

export type SyncConfigCreateParams = Omit<SyncConfig, 'id'>;
export type SyncConfigUpdateParams = SyncConfigCreateParams;

export type SyncConfigData = {
  defaultConfig: SyncStrategyConfig;
  commonObjects: CommonObjectConfig[];
  rawObjects: RawObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncType;
};

export type CommonObjectConfig = {
  object: string;
  // If true, all fields will be fetched into the raw object and not just the ones needed for the common model.
  fetchAllFieldsIntoRaw: boolean;
  configOverride?: Partial<SyncStrategyConfig>;
};

export type RawObjectConfig = {
  object: string;
  configOverride?: Partial<SyncStrategyConfig>;
};
