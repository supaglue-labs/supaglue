import { default as extCamelcaseKeys } from 'camelcase-keys';

export function camelcaseKeys<T extends Record<string, any>>(inputObject: T) {
  return extCamelcaseKeys(inputObject, {
    deep: true,
  });
}

export function camelcaseKeysSansCustomFields<T extends Record<string, any> & { custom_fields?: Record<string, any> }>(
  inputObject: T
) {
  return {
    ...camelcaseKeys(inputObject),
    customFields: inputObject.custom_fields,
  };
}
