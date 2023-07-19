---
description: ''
---

# Managed syncs (reads)

Managed Syncs lets you sync data from your customers’ CRM directly into your own application database or data warehouse.
![managed_syncs_diagram](/img/managed-syncs-diagram-2.png 'managed syncs diagram')

## How it works
You can set up a managed sync in about 5 minutes.

1. You configure the parameters of the sync (providers, destination, sync configuration). This can be done via UI in the management portal, or programmatically via the management API.
2. Your customer creates a connection via our managed authentication flow, and optionally defines field mappings specific to their source.
3. Supaglue starts fetching data from your customers’ source and landing them in your destination (e.g. Postgres).

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

<TabItem value="s3-provider-config" label="S3">

```json
{
  "id": 3,
  "name": "my production s3",
  "type": "s3",
  "credentials": {
    "access_key_id": "AKUADFSSDFS",
    "secret_access_key": "C12389cs809c809s809s",
    "region": "us-west-2",
    "bucket": "my-s3-bucket"
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
      "object": "contact",
    },
    {
      "object": "account",
    },
  ],
  "standard_objects": [
    {
      "object": "Opportunity"
    },
  ],
  "custom_objects": [
    {
      "object": "MyCustomObject__c"
    },
  ]
}
```

The above sync configuration defines a managed sync that does the following:
- Fetch the Contact and Account objects from Salesforce, and normalize the response into a Supaglue-defined CRM schema.
- Fetch the Opportunity object from Salesforce where the "description" and "revenue" fields can be mapped by each customer to a specific field on the Opportunity object.
- Fetch the `MyCustomObject__c` custom object from Salesforce.

## Field mappings
[Field mappings](../platform/field-mapping) can be used for Managed Syncs to map fields from your customer's third-party tools to your Destinations. It will also be used to reverse-map the same fields if you make writes to their third-party tools using the Actions API.

## Destination schema

In the destination, Supaglue treats common objects differently from provider-specific standard and custom objects.

### Common objects

Supaglue syncs common objects across multiple providers and transforms them into a category-specific (e.g. CRM) normalized schema. There are three types of columns:

* **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
* **Common object fields**: the normalized fields associated with the synced object and the connector category.
* **Raw data**: the raw source data is returned in a JSON blob.

Here's an example of a destination schema associated with a managed sync for a CRM Contact object:

| Field Name               | Data Type |
| ------------------------ | --------- |
| _supaglue_application_id | String    |
| _supaglue_customer_id    | String    |
| _supaglue_provider_name  | String    |
| _supaglue_emitted_at     | Timestamp |
| _supaglue_is_deleted     | Boolean   |
| account_id               | String    |
| addresses                | json      |
| created_at               | Timestamp |
| email_addresses          | json      |
| first_name               | String    |
| id                       | String    |
| is_deleted               | Boolean   |
| last_activity_at         | Timestamp |
| last_modified_at         | Timestamp |
| last_name                | String    |
| lifecycle_stage          | String    |
| owner_id                 | String    |
| phone_numbers            | json      |
| raw_data                 | json      |
| updated_at               | Timestamp |

### Standard and custom objects

Supaglue lands standard and custom objects in provider-specific tables, consisting of the following components:

* **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
* **Raw data**: the raw source data is returned in a JSON blob.

Here's an example of a destination schema associated with a managed sync for a standard object:

| Field Name               | Data Type |
| ------------------------ | --------- |
| _supaglue_application_id | String    |
| _supaglue_customer_id    | String    |
| _supaglue_provider_name  | String    |
| _supaglue_emitted_at     | Timestamp |
| _supaglue_is_deleted     | Boolean   |
| _supaglue_raw_data       | json      |

Supaglue adds a primary key database constraint on `(_supaglue_application_id, supaglue_customer_id, supaglue_provider_name, id)`.

## Query patterns

Refer to destination documentation for query patterns in each destination, e.g. [Postgres](../destinations/postgres#query-patterns).

## Notification webhooks

You can optionally set up a webhook so that Supaglue notifies you each time a sync completes. This can be configured via the management portal, or via the [management API](http://localhost:3001/api/v2/mgmt/webhooks).

![webhook-config](/img/webhook_config.png)