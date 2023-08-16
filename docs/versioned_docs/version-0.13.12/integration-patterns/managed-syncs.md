import ThemedImage from '@theme/ThemedImage';
import BrowserWindow from '@site/src/components/BrowserWindow';

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

1. Use the [Management Portal](https://app.supaglue.io) to create a sync configuration ([SyncConfig](#syncconfig)) that defines "what" and "how" to sync from a third-party [Provider](#provider) to a [Destination](#destination).
2. Your customer connects via our [Managed Authentication](../platform/managed-auth) feature.
3. Supaglue starts fetching data from your customers’ third-party Providers and landing them in your Destination (e.g. Postgres).

:::info
Choose from three ways to data model how Provider objects should map to Destination objects: [Objects](../platform/objects/overview), [Entities](../platform/entities/overview), or [Common Schema](../platform/common-schema/overview).
:::

## Concepts

<ThemedImage
alt="managed syncs concepts"
width="50%"
sources={{
    light: '/img/managed-syncs-concepts.png',
    dark: '/img/managed-syncs-concepts.png',
  }}
/>

### Provider

A Provider is a third-party SaaS tool that Supaglue can connect to, to sync data.

Use the **Connectors --> Providers** page in the Management Portal to configure Oauth app credentials:

<BrowserWindow url="https://app.supaglue.io/application/62605dc1-148e-4c53-a850-82e10f71ed23/connectors/providers/crm/salesforce">

<ThemedImage
alt="provider config"
width="100%"
sources={{
    light: '/img/salesforce-provider-config.png',
    dark: '/img/salesforce-provider-config.png',
  }}
/>

</BrowserWindow>

Example Provider json configuration:

```json
{
  "id": "...",
  "application_id": "...",
  "category": "crm",
  "auth_type": "oauth2",
  "name": "salesforce",
  "config": {
    "oauth": {
      "oauth_scopes": ["id", "api", "refresh_token"],
      "credentials": {
        "oauth_client_id": "3MVG9ux34Ig8G5epaZ61C6cIBMigzByvA_dRqIK173k80emeb13bs.bjU1IxUt8AOAKrZHcymU770sHlopQG_",
        "oauth_client_secret": "EE04112033912B1B62A3BE1DAD7D01903C7256A611A636008AD68434B421CD3C"
      }
    }
  }
}
```

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### Destination

A Destination is a database or data warehouse in your infrastructure where Supaglue can write third-party Provider data to.

Use the **Connectors --> Destinations** page in the Management Portal to configure Oauth app credentials:

<BrowserWindow url="https://app.supaglue.io/application/62605dc1-148e-4c53-a850-82e10f71ed23/connectors/destinations/postgres">

<ThemedImage
alt="destination config"
width="100%"
sources={{
    light: '/img/postgres-destination-config.png',
    dark: '/img/postgres-destination-config.png',
  }}
/>

</BrowserWindow>

<Tabs>

<TabItem value="postgres-provider-config" label="Postgres" default>

Example Destination (Postgres) json configuration:

```json
{
  "id": "...",
  "application_id": "...",
  "name": "My Postgres Destination",
  "type": "postgres",
  "config": {
    "host": "production.cluster-cdhnnutnlctj.us-west-2.rds.amazonaws.com",
    "port": 5432,
    "database": "postgres_prod_db",
    "schema": "public",
    "user": "myuser"
  }
}
```

</TabItem>

</Tabs>

:::info
Before syncing data, Supaglue generates the destination tables and columns in your database if they do not already exist.
:::

### SyncConfig

A SyncConfig ties a Provider (source) to a Destination. It defines what objects to sync and how to sync them (frequency, strategy, etc).

<BrowserWindow url="https://app.supaglue.io/application/62605dc1-148e-4c53-a850-82e10f71ed23/syncs/sync_configs/4427eb3f-3c64-4d1e-bf3a-0646475fc71c">

<ThemedImage
alt="sync config"
width="100%"
sources={{
    light: '/img/salesforce-postgres-sync-config.png',
    dark: '/img/salesforce-postgres-sync-config.png',
  }}
/>

</BrowserWindow>

Example SyncConfig json configuration:

```json
{
  "id": "...",
  "application_id": "...",
  "provider_id": "7f72ec07-e5c1-47fd-8cf5-e71dd13873af",
  "destination_id": "6e7baa88-84dd-4dbc-902a-14522c2984eb",
  "config": {
    "default_config": {
      "period_ms": 60000,
      "strategy": "full then incremental",
      "auto_start_on_connection": true
    },
    "common_objects": [
      {
        "object": "contact"
      }
    ],
    "standard_objects": [
      {
        "object": "Account"
      }
    ],
    "custom_objects": [
      {
        "object": "BattleCard__c"
      }
    ],
    "entities": [
      {
        "entity_id": "3a82409f-c98f-4d25-bbd8-3335de3f12cc"
      }
    ]
  }
}
```

The SyncConfig above defines references a Salesforce Provider config and a Postgres Destination config that does the following:

- Sync the `contact` Supaglue [Common Object](../platform/common-schema/overview).
- Sync `Account` [standard object](../platform/objects/overview) from Salesforce.
- Sync the `BattleCard__c` [custom object](../platform/objects/overview) from Salesforce.
- Sync a customer-mapped object and fields to an [Entity](../platform/entities/overview).

## Data schema in Destination

The exact schema of the data that Supaglue creates in your Destination varies on the data model ([Objects](../platform/objects/overview), [Entities](../platform/entities/overview), [Common Schema](../platform/common-schema/overview)) you choose to use, but all of them contain three types of information:

1. **Supaglue metadata fields**: These specify the application, customer, provider, and timestamps associated with the managed sync.
1. **Raw data**: The raw third-party Provider data. We pass these through as-is.
1. **Normalized data**: The raw data is normalized (hoisted to top-level fields/columns) and mapped based on the [data model](../platform/overview#data-modeling) you chose.
1. (**Mapped data**: This is the same as raw data, but mapped based on the [data model](../platform/overview#data-modeling) you chose. We are working on consolidating Normalized data and Mapped data.)

### Entities

Tables are named `entity_${Entity name}`, e.g. `entity_apolla_contact`.

Example:

```sql
postgres=> \d entity_battlecard
                            Table "staging.entity_battlecard"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 _supaglue_is_deleted     | boolean                        |           | not null |
 _supaglue_raw_data       | jsonb                          |           | not null |
 _supaglue_mapped_data    | jsonb                          |           | not null |
 id                       | text                           |           | not null |
Indexes:
    "entity_battlecard_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

### Objects

Tables are named `${Provider}_${Object name}`, e.g. `salesforce_Account`.

Example:

```sql
postgres=> \d gong_call
                                 Table "staging.gong_call"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 _supaglue_is_deleted     | boolean                        |           | not null |
 _supaglue_raw_data       | jsonb                          |           | not null |
 _supaglue_mapped_data    | jsonb                          |           | not null |
 id                       | text                           |           | not null |
Indexes:
    "gong_call_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

### Common Schema

Tables are named `${category}_${Supaglue Common Object name}`, e.g. `crm_accounts`.

Example:

```sql
postgres=> \d crm_accounts;
                                Table "staging.crm_accounts"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 id                       | text                           |           | not null |
 created_at               | timestamp(3) without time zone |           |          |
 updated_at               | timestamp(3) without time zone |           |          |
 is_deleted               | boolean                        |           | not null |
 last_modified_at         | timestamp(3) without time zone |           | not null |
 name                     | text                           |           |          |
 description              | text                           |           |          |
 industry                 | text                           |           |          |
 website                  | text                           |           |          |
 number_of_employees      | integer                        |           |          |
 addresses                | jsonb                          |           |          |
 phone_numbers            | jsonb                          |           |          |
 last_activity_at         | timestamp(3) without time zone |           |          |
 lifecycle_stage          | text                           |           |          |
 owner_id                 | text                           |           |          |
 raw_data                 | jsonb                          |           |          |
Indexes:
    "crm_accounts_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

## Sync strategies

Supaglue implements two sync strategies:

- `full only`: Every sync fetches all records from the Provider.
- `full then incremental`: The initial sync performs a full sync, then incremental after that using a persistent high watermark.

`full then incremental` is used where we can, but for specific objects and Providers, we may only be able to offer `full only` sync strategies. We list these out in the [Providers](/category/providers) documentation.

:::note
S3 is the only Destination that does not support the `full then incremental` sync strategy.
:::

## Sync behavior

Supaglue executes syncs on a per Entity/Object/Common Schema basis. For example, ten syncs will be created if you are syncing ten Standard Objects. Supaglue schedules them to run simultaneously at the frequency you set. Each sync run is independent, i.e., a failure in one sync will not affect the others.

## Query patterns

Refer to [Destination](/category/destinations) documentation for best practices in each destination, e.g. [Postgres](../destinations/postgres#query-patterns).
