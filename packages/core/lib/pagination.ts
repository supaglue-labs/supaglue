import type { PaginationInternalParams, PaginationParams, ProviderName } from '@supaglue/types';
import { BadRequestError } from '../errors';

export const MAX_PAGE_SIZE = 1000;

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

export const toPaginationInternalParams = (paginationParams: PaginationParams): PaginationInternalParams => {
  const page_size = paginationParams.page_size ? parseInt(paginationParams.page_size, 10) : MAX_PAGE_SIZE;
  if (isNaN(page_size)) {
    throw new BadRequestError('Unable to parse page_size');
  }
  if (page_size > MAX_PAGE_SIZE) {
    throw new BadRequestError(`page_size cannot exceed ${MAX_PAGE_SIZE}`);
  }
  return {
    cursor: paginationParams.cursor,
    page_size: paginationParams.page_size ? parseInt(paginationParams.page_size) : MAX_PAGE_SIZE,
  };
};

export type PaginatedSupaglueRecords = {
  pagination: {
    previous: string | null;
    next: string | null;
    total_count: number;
  };
  records: SupaglueRecord[];
};

export type SupaglueRecord = {
  _supaglue_application_id: string;
  _supaglue_provider_name: ProviderName;
  _supaglue_customer_id: string;
  _supaglue_id: string;
  _supaglue_emitted_at: Date;
  _supaglue_last_modified_at: Date;
  _supaglue_is_deleted: boolean;
  _supaglue_raw_data: Record<string, unknown>;
};

// The assumption is that `rows` has `pageSize + 1` or fewer records. If there are `pageSize + 1` records, then we know there are more records.
export const getPaginatedSupaglueRecords = (
  rows: SupaglueRecord[],
  totalCount: number,
  pageSize: number,
  cursor?: Cursor
): PaginatedSupaglueRecords => {
  if (rows.length === pageSize + 1) {
    if (isForward(cursor)) {
      return {
        pagination: {
          next: encodeCursor({ reverse: false, id: rows[pageSize - 1]._supaglue_id }),
          previous: cursor ? encodeCursor({ reverse: true, id: rows[0]._supaglue_id }) : null,
          total_count: totalCount,
        },
        records: rows.slice(0, pageSize),
      };
    }
    return {
      pagination: {
        next: encodeCursor({ reverse: false, id: rows[0]._supaglue_id }),
        previous: encodeCursor({ reverse: true, id: rows[pageSize - 1]._supaglue_id }),
        total_count: totalCount,
      },
      records: rows.slice(1).reverse(),
    };
  }
  if (isForward(cursor)) {
    return {
      pagination: {
        next: null,
        previous: cursor ? encodeCursor({ reverse: true, id: rows[0]._supaglue_id }) : null,
        total_count: totalCount,
      },
      records: rows,
    };
  }
  return {
    pagination: {
      next: encodeCursor({ reverse: false, id: rows[0]._supaglue_id }),
      previous: null,
      total_count: totalCount,
    },
    records: rows.reverse(),
  };
};

export const isForward = (cursor?: Cursor): boolean => !cursor?.reverse;
