import { CommonModelType, SyncType } from '.';

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
  // DEPRECATED: Use schemaId Instead.
  // If true, all fields will be fetched into the raw object and not just the ones needed for the common model.
  fetchAllFieldsIntoRaw: boolean;
  // If set, will sync only these fields in addition to the common model. If unset, will sync all fields into the `rawData` column.
  schemaId?: string;
};

export type StandardObjectConfig = {
  object: string;
  schemaId?: string;
};

export type CustomObjectConfig = {
  object: string;
};
