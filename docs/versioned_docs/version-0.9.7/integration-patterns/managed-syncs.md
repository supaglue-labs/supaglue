---
description: ''
---

# Managed syncs

Managed Syncs helps you sync data from your customers’ CRM directly into your own application database and data warehouse.
![managed_syncs_diagram](/img/managed-syncs-diagram.png 'managed syncs diagram')

## How it works

1. Developer defines the parameters of the sync via the Supaglue management API – including the providers, destination, and integration (frequency, objects, sync strategy, etc).
2. When a customer connects their CRM account via an OAuth flow, a connection config is created that optionally contains customer-specific field mappings.
3. Supaglue sync workers execute workflows that fetch data from your customers’ source and land them in your destination (e.g. Postgres).

You can set up a managed sync in 5 minutes.

## Configuration

### Provider configuration

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

### Destination configuration

Before Supaglue begins syncing data, we generate the destination tables and columns in your database if they do not exist.

```json
// destination config (postgres)
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
}
// destination config (s3)
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

### Sync configuration

The first sync will sync all historical data, irrespective of the sync strategy specified.

```json
{
  "id": 1,
  "name": "my salesforce sync",
  "destination_id": 1,
  "provider_id": 2
  "config": {
    "period_ms": 3600,
    "strategy": "full refresh",
  },
  "objects": [{
      "object": "Contact",
      "supaglue_common_schema": false,  // default: true
      "raw_fields": false,               // default: true
      "custom_schema": {                 // optional: developer-defined schema for customers to map
        "version": 1,
        "fields": ["FirstName", "LastName"]
      }
    }, {
      "object": "Account",
      "supaglue_common_schema": false,
      "raw_fields": false,
      "custom_schema": {
        "version": 1,
        "fields": ["Name", "Description"]
      }
    }, {
      "object": "Opportunity",
      "custom_schema": {
        "version": 1,
        "fields": ["Name", "Amount", "CloseDate"]
      }
    }, {
      "object": "EmailMessage" // default: writes supaglue's common schema (if available) and all raw fields
    }, {
      "object": "EmailTemplate"
    }, {
      "object": "Employee"
    }]
  }
}
```

### Customer-specific field mappings

Sometimes, your customers may store data in non-standard fields (e.g. custom fields). Supaglue allows you optionally specify a `custom_schema` object in the sync configuration that each of your customers can map their source schema to:

```json
...

"custom_schema": {
  "version": 1,
  "fields": ["Revenue"]
}
...
```

In this example, you want to sync revenue for each of your customers. Each of your customers can then map the appropriate revenue field to your "Revenue" field. At runtime, Supaglue will apply each customer's mapping and land the appropriate data into the revenue column in your destination.


## Destination schema

The destination schema consists of the following components:
* **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
* **Common model fields**: when `supaglue_common_schema: true` is set in the sync configuration, the common model fields associated with the synced object and the connector category are returned.
* **Raw data**: when `raw_fields: true` is set in the sync configuration, the raw source data is returned in a JSON blob.

This is an example of a destination schema associated with a managed sync for a CRM Contact object:

| Field Name               | Data Type |
| ------------------------ | --------- |
| _supaglue_application_id | String    |
| _supaglue_customer_id    | String    |
| _supaglue_provider_name  | String    |
| _supaglue_emitted_at     | Timestamp |
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

## Notification webhooks

You can optionally configure a webhook so that Supaglue notifies you each time a sync completes. This can be done via the management portal, or via the [management API](http://docs.supaglue.com/api/v2/mgmt#tag/Webhook).

![webhook-config](/img/webhook_config.png)
