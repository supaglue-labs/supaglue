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

export function camelcaseKeysSansHeaders<T extends Record<string, any> & { headers?: Record<string, any> }>(
  inputObject: T
) {
  return {
    ...camelcaseKeys(inputObject),
    headers: inputObject.headers,
  };
}

export function camelcaseKeysSansFields<T extends Record<string, any> & { fields?: Record<string, any> }>(
  inputObject: T
) {
  return {
    ...camelcaseKeys(inputObject),
    fields: inputObject.fields,
  };
}
