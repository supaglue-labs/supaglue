import type { SnakecasedKeys } from './snakecased_keys';

export type ListedObjectRecordRawDataOnly<D = Record<string, unknown>> = {
  id: string;
  rawData: D;
  isDeleted: boolean;
  lastModifiedAt: Date;
  emittedAt: Date;
};

export type ListedObjectRecord<
  D extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>
> = ListedObjectRecordRawDataOnly<D> & {
  // rawProperties should only have properties
  // - in salesforce, this is easy
  // - in hubspot, we have to only record the data in `properties`
  rawProperties: P;
};

export type MappedListedObjectRecord<D extends Record<string, unknown> = Record<string, unknown>> =
  ListedObjectRecordRawDataOnly<D> & {
    // mappedProperties should only have properties
    // - in salesforce, this is easy
    // - in hubspot, we have to only record the data in `properties`
    mappedProperties: PropertiesWithAdditionalFields;
  };

export type SnakecasedKeysObjectRecord<T extends Record<string, unknown> = Record<string, unknown>> = SnakecasedKeys<
  ListedObjectRecord<T>
>;

export type PropertiesWithAdditionalFields = {
  [key: string]: unknown;
  additionalFields?: Record<string, unknown>;
};

export type TransformedPropertiesWithAdditionalFields = {
  [key: string]: unknown;
  _supaglue_additional_fields?: Record<string, unknown>;
};

type BaseCreatedObjectRecord = {
  id: string;
};

export type CreatedObjectRecord = BaseCreatedObjectRecord & {
  objectName: string;
};

export type ObjectRecordUpsertData = Record<string, unknown>;

export type ObjectRecordData = PropertiesWithAdditionalFields;

type BaseObjectRecord = {
  id: string;
  data: ObjectRecordData;
};

export type ObjectRecord = BaseObjectRecord & {
  objectName: string;
};

export type ObjectRecordWithMetadata = ObjectRecord & {
  metadata: ObjectMetadata;
};

export type ObjectMetadata = {
  isDeleted: boolean;
  lastModifiedAt: Date;
};

export type BaseFullRecord = {
  id: string;
  mappedProperties: ObjectRecordData;
  rawData: Record<string, unknown>;
  metadata: ObjectMetadata;
};

export type FullObjectRecord = BaseFullRecord & {
  objectName: string;
};
