---
description: ''
sidebar_position: 1
---

import BrowserWindow from '@site/src/components/BrowserWindow';

# Standard objects

Supaglue Standard Objects are pre-defined objects in third-party providers, e.g. Contacts, Accounts, and Leads are pre-defined objects in Salesforce and are Standard Objects in Supaglue.

You can use Standard Objects as part of [Managed Syncs](../integration-patterns/managed-syncs) and [Actions API](../integration-patterns/actions-api).

## Managed Syncs (reads)

Sync Standard Objects to your Destination using Managed Syncs.

### Configuration

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Standard Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/configuration/providers/crm/salesforce">

![image](/img/standard-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `OpportunityLineItem`, `Contract`, and `Quote` Standard Objects. Supaglue will sync these Standard Objects.

Since Standard Objects vary by Provider, you need to select the Standard Objects separately for each Provider. The casing of the Standard Objects is also provider-specific, e.g. Standard Objects for Salesforce are "PascalCase".

### Data schema

Supaglue will land the data in your Destination with the following schema:

```
postgres=> \d "salesforce_Contract"
                             Table "public.salesforce_Contract"
          Column          |              Type              | Collation | Nullable | Default
--------------------------+--------------------------------+-----------+----------+---------
 _supaglue_application_id | text                           |           | not null |
 _supaglue_provider_name  | text                           |           | not null |
 _supaglue_customer_id    | text                           |           | not null |
 _supaglue_emitted_at     | timestamp(3) without time zone |           | not null |
 _supaglue_is_deleted     | boolean                        |           | not null |
 _supaglue_raw_data       | jsonb                          |           | not null |
 id                       | text                           |           | not null |
Indexes:
    "salesforce_Contract_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

## Actions API (writes)

:::info
The Actions API for Standard Objects is under construction.
:::

Use the Actions API to write [Common Objects](common-schema) to your customer's third-party Provider.

## Schemas & Field Mappings

:::info
Under construction
:::
