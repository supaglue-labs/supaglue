export function getPaginationParams<CursorType extends BaseCursor>(
  pageSize: number | undefined,
  cursorStr: string | undefined
) {
  const cursor = decodeCursor<CursorType>(cursorStr);
  let take = pageSize;
  if (cursor?.reverse && pageSize) {
    take = -pageSize;
  }
  return {
    take,
    skip: cursor ? 1 : undefined,
    cursor,
  };
}

export function getPaginationResult<CursorType extends BaseCursor>(
  pageSize: number | undefined,
  cursorStr: string | undefined,
  results: Omit<CursorType, 'reverse'>[]
) {
  const cursor = decodeCursor<CursorType>(cursorStr);
  let next = null;
  let previous = null;
  if (pageSize && results.length === pageSize) {
    const lastResult = results[pageSize - 1];
    next = encodeCursor({ ...lastResult, reverse: false });
  }
  if (cursor && results.length) {
    const firstResult = results[0];
    previous = encodeCursor({ ...firstResult, reverse: true });
  }
  return {
    next,
    previous,
  };
}

type BaseCursor = {
  reverse: boolean;
  id: string;
};

export type IdCursor = BaseCursor;

export type DateAndIdCursor = BaseCursor & {
  lastModifiedAt: Date;
};

export const encodeCursor = (cursorParams: IdCursor | DateAndIdCursor): string => {
  return Buffer.from(JSON.stringify(cursorParams), 'binary').toString('base64');
};

export function decodeCursor<CursorType extends BaseCursor>(encoded?: string): CursorType | undefined {
  if (!encoded) {
    return;
  }
  return JSON.parse(Buffer.from(encoded, 'base64').toString('binary'));
}
