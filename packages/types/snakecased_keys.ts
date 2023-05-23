type CamelToSnake<T extends string> = T extends `${infer Head}${infer Tail}`
  ? `${Head extends Uppercase<Head> ? `_${Lowercase<Head>}` : Head}${CamelToSnake<Tail>}`
  : T;

export type SnakecasedKeys<T> = {
  [K in keyof T as CamelToSnake<K & string>]: T[K] extends Record<string, unknown> | null | undefined
    ? SnakecasedKeys<T[K]>
    : T[K] extends Array<infer U>
    ? Array<U extends Record<string, unknown> ? SnakecasedKeys<U> : U>
    : T[K];
};
