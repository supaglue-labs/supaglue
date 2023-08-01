import ThemedImage from '@theme/ThemedImage';

# Managed syncs (reads)

Managed syncs let you sync data from your customers’ third-party provider directly into your own application database or data warehouse.

<ThemedImage
alt="managed syncs diagram"
width="75%"
sources={{
    light: '/img/managed-syncs-diagram-2.png',
    dark: '/img/managed-syncs-diagram-2.png',
  }}
/>

## How it works

1. Configure the sync parameters (customers, providers, destination, sync configuration) using the [Management Portal](https://app.supaglue.io) or [Management API](../api/v2/mgmt/management-api).
2. Your customer connects via our [Managed Authentication](../platform/managed-auth) feature and optionally defines mappings ([Objects](../platform/objects/overview), [Entities](../platform/entities/overview), or [Common Schema](../platform/common-schema/overview)) specific to their third-party Provider.
3. Supaglue starts fetching data from your customers’ third-party Providers and landing them in your Destination (e.g. Postgres).

### Provider configuration

The provider configuration defines which providers to sync from (e.g. Salesforce), and allows your customers to connect securely through Supaglue's managed authentication.

```json
{
  "provider_name": "salesforce",
  "auth_type": "oauth2",
  "category": "crm",
  "config": {
    "oauth": {
      "oauth_scopes": ["api", "id", "refresh_token"],
      "credentials": {
        "client_id": "7393b5a4-5e20-4648-87af-b7b297793fd1",
        "client_secret": "941b846a-5a8c-48b8-b0e1-41b6d4bc4f1a"
      }
    }
  }
}
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### Destination configuration

The destination configuration defines where we sync to. It is a data store hosted in your cloud.

<Tabs>

<TabItem value="postgres-provider-config" label="Postgres" default>

```json
{
  "id": 2,
  "name": "my production postgres",
  "type": "postgres",
  "credentials": {
    "host": "db.jqmzyaitgfisezefyosx.supabase.co",
    "port": 5432,
    "database": "postgres",
    "schema": "supaglue",
    "user": "admin",
    "password": "admin"
  }
}
```

</TabItem>

</Tabs>

:::info
Before syncing data, Supaglue generates the destination tables and columns in your database if they do not already exist.

:::

### Sync configuration

The sync configuration references the provider and destination configurations, and defines how the managed sync works (frequency, objects, strategy, etc).

```json
{
  "id": 1,
  "name": "my salesforce sync",
  "destination_id": 1,
  "provider_id": 2,
  "default_config": {
    "period_ms": 3600,
    "strategy": "full refresh"
  },
  "common_objects": [
    {
      "object": "contact"
    },
    {
      "object": "account"
    }
  ],
  "standard_objects": [
    {
      "object": "Opportunity"
    }
  ],
  "custom_objects": [
    {
      "object": "MyCustomObject__c"
    }
  ]
}
```

The above sync configuration defines a managed sync that does the following:

- Fetch the Contact and Account objects from Salesforce, and normalize the response into a Supaglue-defined CRM schema.
- Fetch the Opportunity object from Salesforce where the "description" and "revenue" fields can be mapped by each customer to a specific field on the Opportunity object.
- Fetch the `MyCustomObject__c` custom object from Salesforce.

## Destination schema

Supaglue lands data in provider-specific tables consisting of the following components:

- **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
- **Raw data**: the raw source data resides in a JSON blob.
- **Normalized data**: the raw data is normalized (hoisted to top-level fields/columns) and mapped based on the [data model](../platform/overview#data-modeling) you chose.

Here's an example of a destination schema associated with a managed sync for a standard object:

| Field Name                | Data Type |
| ------------------------- | --------- |
| \_supaglue_application_id | String    |
| \_supaglue_customer_id    | String    |
| \_supaglue_provider_name  | String    |
| \_supaglue_emitted_at     | Timestamp |
| \_supaglue_is_deleted     | Boolean   |
| \_supaglue_raw_data       | json      |

:::note
For Postgres/MySQL, Supaglue adds a primary key database constraint on `(_supaglue_application_id, supaglue_customer_id, supaglue_provider_name, id)`.
:::

## Query patterns

Refer to destination documentation for query patterns in each destination, e.g. [Postgres](../destinations/postgres#query-patterns).
