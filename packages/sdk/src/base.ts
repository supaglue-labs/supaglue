import { FieldMapping } from './defaultFieldMapping';
import { RetryPolicy } from './retry_policy';
import { Schema } from './schema';

export type BaseSyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)

  // TODO: We will want to allow customer to choose for outbound down the road
  salesforceObject: 'Contact' | 'Lead' | 'Account' | 'Opportunity';

  // some valid cron string
  // TODO: we'll want to allow triggered sync runs down the line
  cronExpression: string;

  // TODO: support incremental
  strategy: 'full_refresh';

  defaultFieldMapping?: FieldMapping[];
};

type BaseInternalIntegration = {
  schema: Schema;

  // TODO: Need to properly figure out where to put this abstraction when we spend more time on
  // IntegrationSDK and retries/rate limits.
  retryPolicy?: RetryPolicy;
};

export type PostgresCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
  };
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type WebhookInternalIntegration = BaseInternalIntegration & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType; // GET, POST, etc.
    headers?: string | string[]; // Authorization header etc.
  };
};
