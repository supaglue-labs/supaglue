---
description: ''
---

# Managed syncs

Managed Syncs helps you sync data from your customers’ CRM directly into your own application database and data warehouse.

How it works:

1. Developer defines the parameters of the sync via the Supaglue management API – including the providers, destination, and integration (frequency, objects, sync strategy, etc).
2. When a customer connects their CRM account via an OAuth flow, a connection config is created that optionally contains customer-specific field mappings.
3. Supaglue sync workers execute workflows that fetch data from your customers’ source and land them in your destination (e.g. Postgres).

You can setup a managed sync in 5 minutes.

[video]


## Provider configuration

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
   },
}
```

## Destination configuration

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

## Sync configuration

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
      "supaglue_unified_schema": false,  // default: true
      "raw_fields": false,               // default: true
      "custom_schema": {                 // optional: developer-defined schema for customers to map
        "version": 1,
        "fields": ["FirstName", "LastName"]
      }
    }, {
      "object": "Account",
      "supaglue_unified_schema": false,
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
      "object": "EmailMessage" // default: writes supaglue's unified schema (if available) and all raw fields
    }, {
      "object": "EmailTemplate"
    }, {
      "object": "Employee"
    }]
	}
}
```


## Notification webhooks

You can optionally configure a webhook so that Supaglue notifies you each time a sync completes.
