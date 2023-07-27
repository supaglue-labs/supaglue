---
description: ''
---

# Managed syncs (reads)

Managed Syncs lets you sync data from your customers’ third-party Provider directly into your own application database or data warehouse.
![managed_syncs_diagram](/img/managed-syncs-diagram-2.png 'managed syncs diagram')

## How it works

You can set up a managed sync in about 5 minutes.

1. Configure the sync parameters (customers, providers, destination, sync configuration) using the [Management Portal](https://app.supaglue.io) or [Management API](../api/v2/mgmt/supaglue-management-api).
2. Your customer connects via our [Managed Authentication](../platform/managed-auth) feature and optionally defines field mappings specific to their third-party Provider.
3. Supaglue starts fetching data from your customers’ third-party Providers and landing them in your Destination (e.g. Postgres).

## Configuration

You can configure a managed sync through a UI in the management portal, or programmatically via the management API.

### Provider configuration

The provider configuration defines which providers to sync from (e.g. Salesforce), and allows your customers to connect securely through Supaglue's management authentication.

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

The destination configuration defines where we sync to. This is usually a data store hosted in your cloud.

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
    "database": "postgres", // ex. parameterization: "${SUPAGLUE_CUSTOMER_ID}"
    "schema": "supaglue",   // ex. parameterization: "${SUPAGLUE_CUSTOMER_ID}"
    "user": "admin",
    "password": "admin"
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

### Standard and custom objects

Supaglue lands standard and custom objects in provider-specific tables, consisting of the following components:

- **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
- **Raw data**: the raw source data is returned in a JSON blob.

Here's an example of a destination schema associated with a managed sync for a standard object:

| Field Name                | Data Type |
| ------------------------- | --------- |
| \_supaglue_application_id | String    |
| \_supaglue_customer_id    | String    |
| \_supaglue_provider_name  | String    |
| \_supaglue_emitted_at     | Timestamp |
| \_supaglue_is_deleted     | Boolean   |
| \_supaglue_raw_data       | json      |

Supaglue adds a primary key database constraint on `(_supaglue_application_id, supaglue_customer_id, supaglue_provider_name, id)`.

## Query patterns

Refer to destination documentation for query patterns in each destination, e.g. [Postgres](../destinations/postgres#query-patterns).

## Notification webhooks

You can optionally set up a webhook so that Supaglue notifies you each time a sync completes. This can be configured via the management portal, or via the [management API](../api/v2/mgmt/webhooks).

![webhook-config](/img/webhook_config.png)
