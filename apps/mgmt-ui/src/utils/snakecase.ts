import { default as extSnakecaseKeys } from 'snakecase-keys';

export function snakecaseKeys<T extends Record<string, unknown>>(inputObject: T) {
  return extSnakecaseKeys(inputObject, {
    deep: true,
  });
}
