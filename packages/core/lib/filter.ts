import { Filter } from '@supaglue/types/filter';

export const getWhereClauseForFilter = (filter: Filter | undefined) => {
  if (!filter) {
    return;
  }
  switch (filter.type) {
    case 'equals':
      return filter.value;
    case 'contains':
      return {
        contains: filter.value,
      };
  }
};
