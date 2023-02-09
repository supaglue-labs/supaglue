type Field = {
  name: string; // Raw field name.
  label?: string; // Human-readable label to be displayed to customers.
  description?: string;
  required?: boolean; // Defaults to false.
};

export type Schema = {
  fields: Field[];
};

type BaseInternalIntegration = {
  schema: Schema;

  // TODO: Need to properly figure out where to put this abstraction when we spend more time on
  // IntegrationSDK and retries/rate limits.
  retryPolicy?: RetryPolicy;
};

type RetryPolicy = {
  // TODO: more customization
  retries?: number;
};

export type PostgresInternalIntegration = BaseInternalIntegration & {
  type: 'postgres';
  config: {
    credentials: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
    };
    table: string;
    customerIdColumn: string;
  };
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type WebhookInternalIntegration = BaseInternalIntegration & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType; // GET, POST, etc.
    headers?: string | string[]; // Authorization header etc.
  };
};

export type PostgresDestination = PostgresInternalIntegration & {
  config: {
    upsertKey: string;
  };
};

export type WebhookDestination = WebhookInternalIntegration;

export type InternalDestination = PostgresDestination | WebhookDestination;

export type PostgresSource = PostgresInternalIntegration;

export type InternalSource = PostgresSource;

export type FieldMapping = {
  name: string;
  field: string;
};

export type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

type SalesforceObject = 'Contact' | 'Lead' | 'Account' | 'Opportunity';

type SpecifiedSalesforceObjectConfig = {
  type: 'specified';
  object: SalesforceObject;
};

type SelectableSalesforceObjectConfig = {
  type: 'selectable';
  objectChoices: SalesforceObject[];
};

export type SalesforceObjectConfig = SpecifiedSalesforceObjectConfig | SelectableSalesforceObjectConfig;

type BaseCustomerIntegration = object;

type SalesforceCustomerIntegration = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
};

type SalesforceSource = SalesforceCustomerIntegration;

type CustomerSource = SalesforceSource;

type SalesforceDestination = SalesforceCustomerIntegration & {
  upsertKey: string; // ext_id
};

type CustomerDestination = SalesforceDestination;

type BaseSyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)

  // some valid cron string
  // TODO: we'll want to allow triggered sync runs down the line
  cronExpression: string;

  // TODO: support incremental
  strategy: 'full_refresh';

  defaultFieldMapping?: FieldMapping[];
};

export type InboundSyncConfig = BaseSyncConfig & {
  type: 'inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

export type OutboundSyncConfig = BaseSyncConfig & {
  type: 'outbound';

  source: InternalSource;
  destination: CustomerDestination;
};

export type SyncConfig = InboundSyncConfig | OutboundSyncConfig;

export type DeveloperConfigSpec = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

export class DeveloperConfig {
  #spec: DeveloperConfigSpec;

  public constructor(spec: DeveloperConfigSpec) {
    // TODO We may elect to use a different internal structure here in the future
    this.#spec = spec;
  }

  // TODO: Actually do some validation later, e.g. that we don't have duplicated SyncConfig names.
  public validate(): void {
    return;
  }

  public getSyncConfig(name: string): SyncConfig {
    const syncConfig = this.#spec.syncConfigs.find((s) => s.name === name);
    if (!syncConfig) {
      throw new Error(`SyncConfig not found for ${name}`);
    }
    return syncConfig;
  }

  public getSyncConfigs(): SyncConfig[] {
    return this.#spec.syncConfigs;
  }

  public getSpec(): DeveloperConfigSpec {
    return this.#spec;
  }

  public getSalesforceCredentials(): SalesforceCredentials {
    return this.#spec.salesforceCredentials;
  }
}
