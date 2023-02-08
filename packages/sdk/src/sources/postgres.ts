import { PostgresInternalIntegration } from '../internalIntegrations';

export type PostgresSource = PostgresInternalIntegration;

export function postgres(params: Omit<PostgresSource, 'type'>): PostgresSource {
  return {
    type: 'postgres',
    ...params,
  };
}
