import { PostgresInternalIntegration } from '../base';

export type PostgresSource = PostgresInternalIntegration;

export function postgres(params: Omit<PostgresSource, 'type'>): PostgresSource {
  return {
    type: 'postgres',
    ...params,
  };
}
