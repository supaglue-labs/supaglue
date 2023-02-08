import { PostgresCredentials, PostgresInternalIntegration } from '../base';

export type PostgresDestination = PostgresInternalIntegration & {
  config: {
    upsertKey: string;
  };
};

export function postgres(params: Omit<PostgresDestination, 'type'>): PostgresDestination {
  return {
    type: 'postgres',
    ...params,
  };
}

export function postgresCredentials(params: PostgresCredentials): PostgresCredentials {
  return params;
}
