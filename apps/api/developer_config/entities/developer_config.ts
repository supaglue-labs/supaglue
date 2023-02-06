type Field = {
  name: string; // Raw field name.
  label?: string; // Human-readable label to be displayed to customers.
  description?: string;
  required?: boolean; // Defaults to false.
};

export type Schema = {
  fields: Field[];
};

type RetryPolicy = {
  // TODO: more customization
  retries?: number;
};

type BaseDestination = {
  schema: Schema;
  // TODO: This retry policy may only be relevant for call-based destinations,
  // so we may want to move this out from `BaseDestinationParams` later.
  // Also, it's not clear at what level the retry policy is configured at.
  // For example, for Postgres destination, we write records one by one.
  // Does the retry policy apply to any individual record or to some
  // larger group of records?
  retryPolicy?: RetryPolicy;
};

export type PostgresDestination = BaseDestination & {
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
    upsertKey: string;
    customerIdColumn: string;
  };
};

type HttpRequestType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type WebhookDestination = BaseDestination & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType; // GET, POST, etc.
    headers?: string | string[]; // Authorization header etc.
  };
};

export type Destination = PostgresDestination | WebhookDestination;

export type FieldMapping = {
  name: string;
  field: string;
};

export type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

export type SyncStrategy = 'full_refresh' | 'incremental';

export type SyncConfig = {
  name: string; // unique (e.g. ContactSync, LeadSync, AccountSync)
  salesforceObject: 'Contact' | 'Lead' | 'Account' | 'Opportunity';
  cronExpression: string; // Some valid cron string
  destination: Destination;
  strategy: SyncStrategy;
  defaultFieldMapping?: FieldMapping[];
};

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
