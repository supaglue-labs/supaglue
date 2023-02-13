---
sidebar_position: 5
---

# Config SDK (Salesforce)

:::caution

Supaglue is in Public Alpha. There are currently many missing features, interfaces will likely change, and it is not production-ready yet.

:::

Use **Supaglue's Config SDK**, a Typescript-based configuration language, to define [Developer Configs](./concepts#developer-config).

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

Entry-point for creating a Supaglue [Developer Config](./concepts#developer-config): a set of [Sync Configs](./concepts#sync-config) and Salesforce credentials metadata.

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

#### `syncConfigs.inbound(params: Params)` or `syncConfigs.outbound(params: Params)`

One [Sync Config](./concepts#sync-config).

```typescript
// InboundSyncConfigParams
type Params = {
  name: string;
  cronExpression: string;
  strategy: 'full_refresh';
  defaultFieldMapping?: DefaultFieldMapping;
  source: CustomerSource;
  destination: InternalDestination;
};
```

```typescript
// OutboundSyncConfigParams
type Params = {
  name: string;
  cronExpression: string;
  strategy: 'full_refresh';
  defaultFieldMapping?: DefaultFieldMapping;
  source: InternalSource;
  destination: CustomerDestination;
};
```

#### `schema(params: Params)`

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

#### `internal.destinations.postgres(params: Params)`

A Postgres [Internal Destination](./concepts#internaldestination).

```typescript
type Params = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
    upsertKey: string;
  };
};
```

#### `internal.destinations.webhook(params: Params)`

A webhook [Internal Destination](./concepts#internaldestination).

```typescript
type Params = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
  config: {
    url: string;
    requestType: HttpRequestType;
    headers?: string | string[];
  };
};
```

#### `internal.sources.postgres(params: Params)`

A Postgres [Internal Source](./concepts#internalsource).

```typescript
type Params = {
  schema: Schema;
  retryPolicy?: RetryPolicy;
  config: {
    credentials: PostgresCredentials;
    table: string;
    customerIdColumn: string;
  };
};
```

#### `customer.destinations.salesforce(params: Params)`

A Salesforce [Customer Destination](./concepts#customerdestination). You can configure
a specific Salesforce object to sync or allow the customer to choose from a list.

```typescript
type Params = {
  objectConfig: SalesforceObjectConfig;
  upsertKey: string;
};

const objectConfig1 = sdk.customer.common.salesforce.specifiedObjectConfig('Contact');
const objectConfig2 = sdk.customer.common.salesforce.selectableObjectConfig(['Lead', 'Contact']);
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
const credentials = sdk.internal.common.postgres.credentials({
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
sdk.syncConfigs.inbound({
  name: 'Contacts',
  source: sdk.customer.sources.salesforce({
    objectConfig: sdk.customer.common.salesforce.specifiedObjectConfig('Contact'),
  }),
  cronExpression: '* * * * *',
  destination: sdk.internal.destinations.postgres({
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
