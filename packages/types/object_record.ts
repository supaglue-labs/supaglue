import type { SnakecasedKeys } from './snakecased_keys';

export type ObjectRecordRawDataOnly<D = Record<string, unknown>> = {
  id: string;
  rawData: D;
  isDeleted: boolean;
  lastModifiedAt: Date;
  emittedAt: Date;
};

export type ObjectRecord<
  D extends Record<string, unknown> = Record<string, unknown>,
  P extends Record<string, unknown> = D
> = ObjectRecordRawDataOnly<D> & {
  // the mapped data, in approximately the original shape from the provider
  // - for salesforce, mappedData would look identical to mappedProperties
  // - for hubspot, mappedData would have id, createdAt, updatedAt, associations, etc. at top-level,
  // and `properties` would have the mapped properties, so `mappedProperties` would
  // only contain the subset of data from `mappedData` under the `properties` key.
  mappedData: D;
  mappedProperties: P;
};

export type SnakecasedKeysObjectRecord<T extends Record<string, unknown> = Record<string, unknown>> = SnakecasedKeys<
  ObjectRecord<T>
>;
