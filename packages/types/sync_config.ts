import { CommonModelType, SyncType } from '.';

export type SyncConfig = {
  id: string;
  applicationId: string;
  destinationId: string;
  providerId: string;
  config: SyncConfigData;
};

export type SyncConfigCreateParams = Omit<SyncConfig, 'id'>;
export type SyncConfigUpdateParams = Omit<SyncConfigCreateParams, 'applicationId'>;

export type SyncConfigData = {
  defaultConfig: SyncStrategyConfig;
  commonObjects?: CommonObjectConfig[];
  standardObjects?: StandardObjectConfig[];
  customObjects?: CustomObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncType;
  startSyncOnConnectionCreation: boolean;
};

export type CommonObjectConfig = {
  object: CommonModelType;
};

export type StandardObjectConfig = {
  object: string;
};

export type CustomObjectConfig = {
  object: string;
};
