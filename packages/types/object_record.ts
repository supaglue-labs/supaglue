import type { SnakecasedKeys } from './snakecased_keys';

export type ListedObjectRecordRawDataOnly<D = Record<string, unknown>> = {
  id: string;
  rawData: D;
  isDeleted: boolean;
  lastModifiedAt: Date;
  emittedAt: Date;
};

export type ListedObjectRecord<D extends Record<string, unknown> = Record<string, unknown>> =
  ListedObjectRecordRawDataOnly<D> & {
    // rawProperties should only have properties
    // - in salesforce, this is easy
    // - in hubspot, we have to only record the data in `properties`
    rawProperties: D;
  };

export type MappedListedObjectRecord<D extends Record<string, unknown> = Record<string, unknown>> =
  ListedObjectRecordRawDataOnly<D> & {
    // mappedProperties should only have properties
    // - in salesforce, this is easy
    // - in hubspot, we have to only record the data in `properties`
    mappedProperties: D;
  };

export type SnakecasedKeysObjectRecord<T extends Record<string, unknown> = Record<string, unknown>> = SnakecasedKeys<
  ListedObjectRecord<T>
>;

export type PropertiesWithAdditionalFields = {
  [key: string]: unknown;
  additional_fields?: Record<string, unknown>;
};

type BaseCreatedObjectRecord = {
  id: string;
};

export type CreatedStandardObjectRecord = BaseCreatedObjectRecord & {
  standardObjectName: string;
};

export type ObjectRecordUpsertData = Record<string, unknown>;

export type ObjectRecordData = {
  additionalFields?: Record<string, unknown>;
  [key: string]: unknown;
};

type BaseObjectRecord = {
  id: string;
  data: ObjectRecordData;
};

export type StandardObjectRecord = BaseObjectRecord & {
  standardObjectName: string;
};

export type ObjectRecord = StandardObjectRecord;
