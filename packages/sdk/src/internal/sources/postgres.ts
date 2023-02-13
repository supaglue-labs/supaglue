import { PostgresSource } from '@supaglue/types';

export function postgres(params: Omit<PostgresSource, 'type'>): PostgresSource {
  return {
    type: 'postgres',
    ...params,
  };
}
