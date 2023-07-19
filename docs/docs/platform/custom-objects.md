---
description: ''
sidebar_position: 2
---

import BrowserWindow from '@site/src/components/BrowserWindow';

# Custom objects

Custom Objects are objects that are not pre-defined by third-party Providers. You or your customers may create them.

For example, `ContactDailyMetric` and `ContactMonthlyMetric` are the only contact metric Standard Objects in Salesforce, but your customer may have defined a third Custom Object, `ContactBiannualMetric`.

## Managed Syncs

Sync Custom Objects to your Destination using Managed Syncs.

### Configuration

Use the **Configuration --> Sync Configs** page in the Management Portal to specify the Custom Objects you wish to sync to your Destination.

<BrowserWindow url="https://app.supaglue.io/applications/62605dc1-148e-4c53-a850-82e10f71ed23/configuration/providers/crm/salesforce">

![image](/img/custom-object-sync-config.png)

</BrowserWindow>

The screenshot above shows a Sync Config that specifies `ContactBiannualMetric` and `BattleCard` Custom Objects. Supaglue will sync these Custom Objects.

The casing of Custom Objects is provider-specific.

### Data schema

Supaglue will land the data in your Destination with the following schema:

```
postgres=> \d "salesforce_BattleCard"
                             Table "public.salesforce_BattleCard"
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
    "salesforce_BattleCard_pkey" PRIMARY KEY, btree (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
```

## Actions API

Supaglue's unified Custom Objects Actions API allows you to:

- Create custom objects
- Create custom object records
- Create association types between objects
- Create associations between records

### Example

Suppose you want to store information about competitors relevant to a particular Salesforce Opportunity. You could use Supaglue's Custom Objects API to do the following:

1. Create a custom object called `CompetitorInfo`.
1. Create an association type between `Opportunity` and `CompetitorInfo`.
1. When you create a new `Opportunity` record, find an existing `CompetitorInfo` record (or create a new one) and associate it with the `Opportunity` record.

## Schemas & Field Mappings

:::info
Under construction
:::
