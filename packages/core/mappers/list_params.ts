import { ListInternalParams, ListParams } from '../types/common';

export function toListInternalParams(listParams: ListParams): ListInternalParams {
  return {
    ...listParams,
    include_deleted_data: listParams.include_deleted_data === 'true',
  };
}
