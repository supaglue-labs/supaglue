/**
 * This type is used to ensure that all properties of a type are present in an array.
 */
type EnsureAllProperties<T, U extends T[]> = [T] extends [U[number]] ? unknown : 'Invalid';

/**
 * This function is used to ensure that all properties of a type are present in an array.
 * It will also remove duplicates.
 */
export function arrayOfAllKeys<M>(): <T extends keyof M = keyof M, U extends T[] = T[]>(
  array: U & EnsureAllProperties<T, U>
) => U {
  return (array) => [...new Set(array)] as typeof array;
}
