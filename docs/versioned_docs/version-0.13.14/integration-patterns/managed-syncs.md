import ThemedImage from '@theme/ThemedImage';
import BrowserWindow from '@site/src/components/BrowserWindow';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Managed Syncs

Supaglue writes directly into a database.

<ThemedImage
alt="integration patterns syncs"
width="50%"
sources={{
    light: '/img/integration-patterns-syncs.png',
    dark: '/img/integration-patterns-syncs.png',
  }}
/>

## How it works

1. Use the [Management Portal](https://app.supaglue.io) to create a sync configuration ([SyncConfig](#syncconfig)) that defines "what" and "how" to sync from a third-party [Provider](#provider) to a [Destination](#destination).
2. Your customer connects via our [Managed Authentication](../platform/managed-auth) feature.
3. Supaglue starts fetching data from your customers’ third-party Providers and landing them in your Destination (e.g. Postgres).

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

<Tabs>

<TabItem value="provider-mgmt-ui" label="Mgmt UI" default>

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

</TabItem>

<TabItem value="provider-json" label="JSON" default>

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

</TabItem>

</Tabs>

### Destination

A Destination is a database or data warehouse in your infrastructure where Supaglue can write third-party Provider data to.

Use the **Connectors --> Destinations** page in the Management Portal to configure Oauth app credentials:

<Tabs>

<TabItem value="destination-mgmt-ui" label="Mgmt UI" default>

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

</TabItem>

<TabItem value="destination-json" label="JSON">

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

<Tabs>

<TabItem value="sync-config-mgmt-ui" label="Mgmt UI" default>

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

</TabItem>

<TabItem value="sync-config-json" label="JSON">

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
    "standard_objects": [
      {
        "object": "Account"
      }
    ],
    "custom_objects": [
      {
        "object": "BattleCard__c"
      }
    ]
  }
}
```

The SyncConfig above defines references a Salesforce Provider config and a Postgres Destination config that does the following:

- Sync `Account` [standard object](../platform/objects/overview) from Salesforce.
- Sync the `BattleCard__c` [custom object](../platform/objects/overview) from Salesforce.

</TabItem>

</Tabs>

## Hosting Destinations

You can choose between two methods of hosting Destinations:

1. **Your Destination:** Supaglue will land raw data in your database.
2. **Supaglue-hosted Destination:** Supaglue will land raw data in a Supaglue-hosted Postgres database.

### Deciding on a hosting method

There are several differences between the two methods of hosting Destinations:

| Dimension       | Your application database                                     | Supaglue-hosted database                                    |
| --------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| Transformations | Ideal if you have existing transformation pipelines           | Ideal if you don't have an existing transformation pipeline |
| Compliance      | Your customer data is never stored in Supaglue at-rest        | Your customer data is stored in Supaglue at-rest            |
| Security        | Your database needs to be accessible from the public internet | Your final target database can be behind a VPC              |
| Operational     | You need to ensure your database is up                        | Supaglue will ensure the uptime and sync reliability        |

## Query patterns

### Pattern 1: Direct query

The quickest way to query data is to query the raw JSONB data that Supaglue lands: this is well-suited if you can easily do transforms upon reading the raw data in your application using code. You may optionally add indexes to help query performance.

### Pattern 2: Logical SQL view

You can create Postgres views if you need to rename fields or run transformations easily expressed using SQL.

### Pattern 3: Postgres Generated Columns

Building on Pattern 2, if your SQL transformations are expensive to run at query time, you can use Postgres [Generated Columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html) to speed up queries by pushing the transformation work to be maintained at write time.

### Pattern 4: Transformation pipeline

If you have well-structured tables that you wish to write Supaglue-synced data into, you can paginate over the Supaglue-synced tables, run your transformations, and write the transformed data into your tables.

<ThemedImage
alt="transformation pipeline"
width="75%"
sources={{
    light: '/img/transformation-pipeline.png',
    dark: '/img/transformation-pipeline.png',
  }}
/>

Read more about transformation pipelines and patterns in our [transformation tutorial section](../tutorials/transformations/overview).

## Data schema in Destination

The schema of the data that Supaglue creates in your Destination contains three types of information:

1. **Supaglue metadata fields**: These specify the application, customer, provider, and timestamps associated with the managed sync.
1. **Raw data**: The raw third-party Provider data. We pass these through as-is.
1. **Normalized data**: The raw data is normalized (hoisted to top-level fields/columns).

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
 _supaglue_id             | text                           |           | not null |
Indexes:
    "gong_call_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, _supaglue_id)
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

Supaglue executes syncs on a per Object basis. For example, Supaglue will create ten syncs if you are syncing ten Standard Objects. Supaglue schedules them to run simultaneously at the frequency you set. Each sync run is independent, i.e., a failure in one sync will not affect the others.
