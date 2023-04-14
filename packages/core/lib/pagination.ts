export function getPaginationParams<T extends string | number = string>(
  pageSize: number | undefined,
  cursorStr: string | undefined
) {
  const cursor = decodeCursor(cursorStr);
  let take = pageSize;
  if (cursor?.reverse && pageSize) {
    take = -pageSize;
  }
  return {
    take,
    skip: cursor ? 1 : undefined,
    cursor: cursor ? { id: cursor.id as T } : undefined,
  };
}

export function getPaginationResult<T extends string | number = string>(
  pageSize: number | undefined,
  cursorStr: string | undefined,
  results: { id: T }[]
) {
  const cursor = decodeCursor(cursorStr);
  let next = null;
  let previous = null;
  if (pageSize && results.length === pageSize) {
    const lastResult = results[pageSize - 1];
    next = encodeCursor({ id: lastResult.id, reverse: false });
  }
  if (cursor && results.length) {
    const firstResult = results[0];
    previous = encodeCursor({ id: firstResult.id, reverse: true });
  }
  return {
    next,
    previous,
  };
}

export type Cursor = {
  id: string | number;
  reverse: boolean;
};

export const encodeCursor = (cursorParams: Cursor): string => {
  return Buffer.from(JSON.stringify(cursorParams), 'binary').toString('base64');
};

export const decodeCursor = (encoded?: string): Cursor | undefined => {
  if (!encoded) {
    return;
  }
  return JSON.parse(Buffer.from(encoded, 'base64').toString('binary'));
};
