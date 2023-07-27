import type { SnakecasedKeys } from './snakecased_keys';

export type ObjectRecordRawDataOnly<T = Record<string, any>> = {
  id: string;
  rawData: T;
  isDeleted: boolean;
  lastModifiedAt: Date;
  emittedAt: Date;
};

export type ObjectRecord<T = Record<string, any>> = ObjectRecordRawDataOnly<T> & {
  mappedData: T;
};

export type SnakecasedKeysObjectRecord<T = Record<string, any>> = SnakecasedKeys<ObjectRecord<T>>;
