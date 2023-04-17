import { ListInternalParams, ListParams } from '@supaglue/types';
import { toPaginationInternalParams } from '../lib';

export function toListInternalParams(listParams: ListParams): ListInternalParams {
  return {
    ...toPaginationInternalParams(listParams),
    include_deleted_data: listParams.include_deleted_data === 'true',
  };
}
