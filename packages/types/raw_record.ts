import type { SnakecasedKeys } from './snakecased_keys';

export type NormalizedRawRecord<T = Record<string, any>> = {
  id: string;
  rawData: T;
  isDeleted: boolean;
  lastModifiedAt: Date;
  emittedAt: Date;
};

export type SnakecasedKeysNormalizedRawRecord<T = Record<string, any>> = SnakecasedKeys<NormalizedRawRecord<T>>;
