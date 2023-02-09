import { PostgresCredentials } from '../common/postgres';
import { BaseInternalIntegration } from './base';

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
  };
};
