import { default as extCamelcaseKeys } from 'camelcase-keys';

export function camelcaseKeys<T extends Record<string, any>>(inputObject: T) {
  return extCamelcaseKeys(inputObject, {
    deep: true,
  });
}
