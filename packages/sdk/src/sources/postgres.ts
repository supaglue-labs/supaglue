import { PostgresCredentials, PostgresInternalIntegration } from '../base';

// TODO: These types need to be merged with sdk.destinations.postgresCredentials

export type PostgresSource = PostgresInternalIntegration;

export function postgres(params: Omit<PostgresSource, 'type'>): PostgresSource {
  return {
    type: 'postgres',
    ...params,
  };
}

export function postgresCredentials(params: PostgresCredentials): PostgresCredentials {
  return params;
}
