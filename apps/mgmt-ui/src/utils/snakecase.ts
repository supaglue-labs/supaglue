import { default as extSnakecaseKeys } from 'snakecase-keys';

export function snakecaseKeys<T extends Record<string, unknown>>(inputObject: T) {
  return extSnakecaseKeys(inputObject, {
    deep: true,
  });
}

export function snakecaseKeysSansHeaders<T extends Record<string, any> & { headers?: Record<string, any> }>(
  inputObject: T
) {
  return {
    ...snakecaseKeys(inputObject),
    headers: inputObject.headers,
  };
}
