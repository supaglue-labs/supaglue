import { default as extSnakecaseKeys } from 'snakecase-keys';

/**
 * @deprecated This function is really expensive. Try not to use it.
 * https://github.com/supaglue-labs/supaglue/issues/595
 */
export function snakecaseKeys<T extends Record<string, unknown>>(inputObject: T) {
  return extSnakecaseKeys(inputObject, {
    deep: true,
  });
}

/**
 * @deprecated This function is really expensive. Try not to use it.
 * https://github.com/supaglue-labs/supaglue/issues/595
 */
export function snakecaseKeysSansHeaders<T extends Record<string, any> & { headers?: Record<string, any> }>(
  inputObject: T
) {
  return {
    ...snakecaseKeys(inputObject),
    headers: inputObject.headers,
  };
}
