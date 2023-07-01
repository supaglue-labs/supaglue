import type {
  GetInternalParams,
  GetParams,
  ListInternalParams,
  ListParams,
  SearchInternalParams,
  SearchParams,
} from '@supaglue/types';
import { toPaginationInternalParams } from '../lib';

export function toGetInternalParams(getParams: GetParams): GetInternalParams {
  return {
    include_raw_data: getParams.include_raw_data === 'true',
  };
}

export function toSearchInternalParams(searchParams: SearchParams): SearchInternalParams {
  return {
    ...toGetInternalParams(searchParams),
    ...toPaginationInternalParams(searchParams),
  };
}

export function toListInternalParams(listParams: ListParams): ListInternalParams {
  return {
    ...toGetInternalParams(listParams),
    ...toPaginationInternalParams(listParams),
    include_deleted_data: listParams.include_deleted_data === 'true',
    created_after: listParams.created_after,
    created_before: listParams.created_before,
    modified_after: listParams.modified_after,
    modified_before: listParams.modified_before,
  };
}
