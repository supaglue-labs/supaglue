// TODO: Share this with api
export type DeveloperConfig = {
  syncConfigs: SyncConfig[];
};

const SALESFORCE_OBJECT_TYPES = ['Contact', 'Lead', 'Account', 'Opportunity'] as const;

export type SalesforceObjectType = (typeof SALESFORCE_OBJECT_TYPES)[number];

export type SObjectField = {
  name: string;
  label: string;
};

export type FieldMapping = {
  name: string;
  field: string;
};

export type CustomerFieldMapping = Record<string, string>;
export type SyncUpdateParams = {
  id: string;
  fieldMapping?: CustomerFieldMapping;
  customProperties?: Field[];
};

export type SyncConfig = {
  name: string; // unique
  salesforceObject: SalesforceObjectType;
  cronExpression: string; // Some valid cron string
  destination: Destination;
  // TODO: support incremental
  strategy: 'full_refresh';
  defaultFieldMapping?: FieldMapping[];
  customProperties?: Field[];
};

type BaseDestination = {
  schema: Schema;
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
  };
};

export type WebhookDestination = BaseDestination & {
  type: 'webhook';
  config: {
    url: string;
    requestType: string; // GET, POST, etc.
    header?: string; // Authorization header etc.
  };
};

export type Destination = PostgresDestination | WebhookDestination;

export type Field = {
  name: string; // Raw field name.
  label?: string; // Human-readable label to be displayed to customers.
  description?: string;
  required?: boolean; // Defaults to false.
};

export type Schema = {
  name: string;
  fields: Field[];
};
