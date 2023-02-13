import { PostgresDestination } from '@supaglue/types';

export function postgres(params: Omit<PostgresDestination, 'type'>): PostgresDestination {
  return {
    type: 'postgres',
    ...params,
  };
}
