import { CommonModelType, SyncType } from '.';

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
  commonObjects?: CommonObjectConfig[];
  rawObjects?: RawObjectConfig[];
  rawCustomObjects?: RawCustomObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncType;
  // When this is undefined, we treat it as "true" to be backwards compatible.
  // TODO: When we have time, migrate this to be a required field.
  startSyncOnConnectionCreation?: boolean;
};

export type CommonObjectConfig = {
  object: CommonModelType;
  // If true, all fields will be fetched into the raw object and not just the ones needed for the common model.
  fetchAllFieldsIntoRaw: boolean;
};

export type RawObjectConfig = {
  object: string;
  schema?: RawObjectSchema;
};

export type RawObjectInheritedSchema = {
  type: 'inherited';
};

export type RawObjectDefinedSchema = {
  type: 'defined';
  fields: RawObjectSchemaField[];
  allowAdditionalFieldMappings: boolean;
};

export type RawObjectSchema = RawObjectInheritedSchema | RawObjectDefinedSchema;

export type RawObjectSchemaField = {
  name: string; // my_first_column
  mappedName?: string; // salesforce_first_column
};

export type RawCustomObjectConfig = {
  object: string;
};
