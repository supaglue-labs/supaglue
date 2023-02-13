---
sidebar_position: 4
---

# Concepts

This section goes over the lifecycle of the developer and customer flow using Supaglue.

import ThemedImage from '@theme/ThemedImage';

<ThemedImage
alt="Workflow Diagram"
sources={{
    light: ('/img/workflow_diagram_light.png'),
    dark: ('/img/workflow_diagram_dark.png'),
  }}
/>

1. A [Developer Config](#developer-config) is authored by developers to define a set of [Sync Configs](#sync-config) each of which define the behavior of a [Sync](#sync)
2. Once a Developer Config is deployed to the [Supaglue Integration Service](./architecture), the Sync(s) become available for customers to use
3. Customers opt-in and use Syncs by saving [Sync Values](#sync-values) to the Supaglue Integration Service using [Supaglue React components](./react-components) which are embedded by developers into their applications
4. The Supaglue Integration Service executes Syncs, using the customer-provided Sync Values during runtime, as a [Sync Run](#sync-run)
5. A Sync Run operates on your customer's Salesforce and your application, moving data between the two systems
6. Developers can use the [CLI](./cli) to monitor the statuses of Syncs

## Developer Config

A Developer Config is a Typescript object that declaratively defines the behavior of a set of [Sync Configs](#sync-config). It also contains metadata about Salesforce as a data source.

A Developer Config is authored by the developer and deployed to the Supaglue Integration Service backend which is responsible for parsing it and ultimately executing Sync(s).

### Schema

```typescript
type DeveloperConfigParams = {
  syncConfigs: SyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

type BaseSyncConfig = {
  name: string;
  cronExpression: string;
  strategy: 'full_refresh';
  defaultFieldMapping?: FieldMapping[];
};

type BaseRealtimeSyncConfig = Omit<BaseSyncConfig, 'cronExpression' | 'strategy'>;

type InboundSyncConfig = BaseSyncConfig & {
  type: 'inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

type OutboundSyncConfig = BaseSyncConfig & {
  type: 'outbound';
  source: InternalSource;
  destination: CustomerDestination;
};

type RealtimeInboundSyncConfig = BaseRealtimeSyncConfig & {
  type: 'realtime_inbound';
  source: CustomerSource;
  destination: InternalDestination;
};

export type SyncConfig = InboundSyncConfig | OutboundSyncConfig | RealtimeInboundSyncConfig;

type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};
```

See the [Config SDK](./config_sdk) for a reference and [example](./config_sdk#examples) Developer Config.

### Sync Config

A Sync Config is a Typescript object that declaratively defines the behavior of one [Sync](#sync). One Sync Config defines the following:

1. Whether this sync is inbound or outbound
1. The standard object type to sync to/from Salesforce
1. How often it should sync
1. Where it should deliver the records (Webhook or Postgres or Salesforce)
1. How field mappings between Salesforce and the developer's application should work (i.e. which fields are exposed, how they are displayed, and their default field mappings)
1. Other operational configurations around retries, fetch strategies, and more

:::info

NOTE: A Developer Config is a set of Sync Configs. Your application will likely have one Developer Config, but several Sync Configs.

:::

## Sync

A Sync is a deployed Sync Config that is available for customers to use. Customers interact with Syncs in your application's UI using embedded Supaglue React components.

### Sync Values

Sync Values are customer-provided values related to Syncs that are used at runtime by the Supaglue Integration Service.

### Sync Run

A Sync Run is one instance of Sync execution.

```typescript
type SyncRun = {
  id: string;
  syncId: string;
  result: SyncRunResult;
  startTimestamp: Date;
};
```

## InternalDestination

An InternalDestination is the target system of an Inbound Sync Config, either Postgres or a webhook.

### Schema

```typescript
type BaseInternalIntegration = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
};

export type PostgresDestination = BaseInternalIntegration & {
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
    upsertKey: string;
  };
};

export type WebhookDestination = BaseDestination & {
  type: 'webhook';
  config: {
    url: string;
    requestType: HttpRequestType;
    headers?: string | string[];
  };
};

export type InternalDestination = PostgresDestination | WebhookDestination;
```

## InternalSource

An InternalSource is the source system of an Outbound Sync Config, currently just Postgres.

### Schema

```typescript
type BaseInternalIntegration = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
};

export type PostgresSource = BaseInternalIntegration & {
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

export type InternalSource = PostgresSource;
```

## CustomerDestination

A CustomerDestination is the target system of an Outbound Sync Config, currently just Salesforce.

### Schema

```typescript
type BaseCustomerIntegration = object;

export type SalesforceDestination = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
  upsertKey: string;
};

export type CustomerDestination = SalesforceDestination;
```

## CustomerSource

A CustomerSource is the source system of an Inbound Sync Config, currently just Salesforce.

### Schema

```typescript
type BaseCustomerIntegration = object;

export type SalesforceSource = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
};

export type CustomerSource = SalesforceSource;
```
