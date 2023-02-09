import { PostgresCredentials } from '../common';
import { BaseInternalIntegration } from './base';

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
  };
};
