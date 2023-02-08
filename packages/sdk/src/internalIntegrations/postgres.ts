import { BaseInternalIntegration } from './base';

export type PostgresCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export function postgresCredentials(params: PostgresCredentials): PostgresCredentials {
  return params;
}

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
  };
};
