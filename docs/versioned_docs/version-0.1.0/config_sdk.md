---
sidebar_position: 5
---

# Salesforce (Config SDK)

:::caution

Supaglue is in Public Alpha. There are currently many missing features, interfaces will likely change, and it is not production-ready yet.

:::

## Config SDK

Use **Supaglue's Config SDK**, a Typescript-based configuration language, to define [Developer Configs](/concepts#developer_config).

## Installation

You will need a Node project with Typescript to author Developer Config.

```shell
yarn add @supaglue/sdk
```

Create an entry-point file `index.ts` and call `sdk.config()` in it with a Developer Config.

```typescript
import * as sdk from '@supaglue/sdk';

sdk.config(/* ... */);
```

## Concepts

#### `config(params: DeveloperConfigParams)`

Entry-point for creating a Supaglue [Developer Config](/concepts#developer_config): a set of [Sync Configs](/concepts#sync-config) and Salesforce credentials metadata.

```typescript
type DeveloperConfigParams = {
  syncConfigs: SalesforceSyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

class SalesforceCredentials {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
}
```

#### `salesforce.syncConfig(params: SyncConfigParams)`

One [Sync Config](/concepts#developer_config).

```typescript
type SyncConfigParams = {
  salesforceObject: string;
  name: string;
  cronExpression?: string;
  destination: BaseDestination;
  strategy: 'full_refresh';
  defaultFieldMapping?: DefaultFieldMapping;
};
```

#### `schema(params: SchemaParams)`

A schema for a customer-facing field mapping.

```typescript
type SchemaParams = {
  fields: Field[];
};

type Field = {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
};
```

#### `destinations.postgres(params: PostgresDestinationParams)`

A Postgres [Destination](/concepts#destination).

```typescript
type PostgresDestinationParams = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
  config: {
    credentials: PostgresCredentials;
    table: string;
    upsertKey: string;
    customerIdColumn: string;
  };
};
```

#### `destinations.webhook(params: WebhookDestinationParams)`

A webhook [Destination](/concepts#destination).

```typescript
type WebhookDestinationParams = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
  config: {
    url: string;
    requestType: HttpRequestType;
    headers?: string | string[];
  };
};
```

#### `defaultFieldMapping(fieldMapping: Mapping[], type: 'salesforce')`

A customer-facing default field mapping for when customers don't select values for `schema` above using Supaglue React components.

```typescript
class DefaultFieldMapping {
  type: 'salesforce';
  fieldMapping: Mapping[];
}

type Mapping = {
  name: string;
  field: string;
};
```

## Examples

#### Sync Config for syncing SFDC Contacts

```typescript
import * as sdk from '@supaglue/sdk';

// credentials to write into your application's Postgres
const credentials = sdk.destinations.postgresCredentials({
  host: 'postgres',
  port: 5432,
  database: 'sample_app',
  user: process.env.CONFIG_DB_USER ?? '',
  password: process.env.CONFIG_DB_PASSWORD ?? '',
});

// field mapping to show to customers for SFDC Contacts
const contactSchema = sdk.schema({
  fields: [
    {
      name: 'salesforce_id',
      label: 'id',
    },
    {
      name: 'email',
    },
    {
      name: 'first_name',
      label: 'first name',
    },
  ],
});

// default customer field mapping values
const contactMapping = sdk.defaultFieldMapping(
  [
    { name: 'salesforce_id', field: 'Id' },
    { name: 'email', field: 'Email' },
    { name: 'first_name', field: 'FirstName' },
    { name: 'last_name', field: 'LastName' },
    { name: 'title', field: 'Title' },
  ],
  'salesforce'
);

// export this Sync Config
sdk.config({
  name: 'Contacts',
  salesforceObject: 'Contact',
  cronExpression: '* * * * *',
  destination: sdk.destinations.postgres({
    schema: contactSchema,
    config: {
      credentials,
      table: 'salesforce_contacts',
      upsertKey: 'salesforce_id',
      customerIdColumn: 'customer_id',
    },
    retryPolicy: sdk.retryPolicy({
      retries: 2,
    }),
  }),
  strategy: 'full_refresh',
  defaultFieldMapping: contactMapping,
});
```

## Integrations SDK

Internally, Supaglue uses an evolving Integrations SDK that wraps Salesforce and [Destinations](/concepts#destination) so we can imperatively write business logic for Syncs, which then later get invoked by developers using the Config SDK above. In the future, we can expose the Integrations SDK to developers for you to define your own tailored business logic for Syncs. The rough shape of using it looks like:

```typescript
sg.internalIntegrations.postgres.query();
sg.internalIntegrations.webhook.request();
sg.customerIntegrations.salesforce.query();
```
