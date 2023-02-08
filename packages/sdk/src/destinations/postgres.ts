import { PostgresInternalIntegration } from '../internalIntegrations';

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
