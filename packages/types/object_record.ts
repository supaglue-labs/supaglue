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
    // mapped data should only have properties
    // - in salesforce, this is easy
    // - in hubspot, we have to only record the data in `properties`
    mappedData: D;
  };

export type SnakecasedKeysObjectRecord<T extends Record<string, unknown> = Record<string, unknown>> = SnakecasedKeys<
  ListedObjectRecord<T>
>;

export type PropertiesWithAdditionalFields = {
  [key: string]: unknown;
  additional_fields?: Record<string, unknown>;
};

export type ObjectRecord = {
  id: string;
  data: Record<string, unknown>;
};

export type ObjectRecordUpsertData = Record<string, unknown>;
